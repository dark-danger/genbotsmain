"""Media upload and management endpoints."""
import os
import uuid
import shutil
import time
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from PIL import Image
from sqlalchemy import select

from app.core.config import settings
from app.core.deps import DbSession, AdminUser
from app.models.cms import MediaFile
from app.schemas.content import MediaFileResponse
from app.schemas.common import MessageResponse
from app.utils.audit import log_audit_action

router = APIRouter(prefix="/media", tags=["Media"])

# On Vercel the working directory is read-only; /tmp is the only writable location.
UPLOAD_DIR = "/tmp/uploads" if os.getenv("VERCEL") else "uploads"
try:
    os.makedirs(UPLOAD_DIR, exist_ok=True)
except Exception:
    pass

# Helper to verify magic bytes for safety
def is_safe_file(file_content: bytes, filename: str) -> bool:
    ext = os.path.splitext(filename.lower())[1]
    if ext in [".jpg", ".jpeg"]:
        return file_content.startswith(b"\xff\xd8")
    elif ext == ".png":
        return file_content.startswith(b"\x89PNG")
    elif ext == ".gif":
        return file_content.startswith(b"GIF8")
    elif ext == ".webp":
        return b"WEBP" in file_content[:16]
    # For digital assets like .glb, .usdz, .pdf, we allow them but keep basic validation
    elif ext == ".pdf":
        return file_content.startswith(b"%PDF")
    elif ext in [".glb", ".usdz"]:
        return True # Handled dynamically
    return False

@router.post("/upload", response_model=MediaFileResponse, status_code=201)
async def upload_file(
    db: DbSession,
    admin: AdminUser,
    file: UploadFile = File(...),
    folder: str = Form("general"),
    alt_text: Optional[str] = Form(None)
):
    # 1. Size Check
    file.file.seek(0, os.SEEK_END)
    file_size = file.file.tell()
    file.file.seek(0)
    
    if file_size > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE // (1024 * 1024)}MB"
        )
        
    # Read header for safety check
    header = await file.read(2048)
    file.file.seek(0)
    
    if not is_safe_file(header, file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File signature verification failed. Potential unsafe content detected."
        )

    # 2. Setup paths
    unique_id = uuid.uuid4()
    ext = os.path.splitext(file.filename)[1].lower()
    filename = f"{unique_id}{ext}"
    folder_dir = os.path.join(UPLOAD_DIR, folder)
    os.makedirs(folder_dir, exist_ok=True)
    file_path = os.path.join(folder_dir, filename)
    relative_url = f"/uploads/{folder}/{filename}"
    
    # 3. File Optimization & Compression (Images only)
    temp_path = file_path + ".tmp"
    success = False
    
    for attempt in range(3): # Retry logic
        try:
            if ext in [".jpg", ".jpeg", ".png", ".webp"] and file.content_type.startswith("image/"):
                # Open with PIL
                img = Image.open(file.file)
                # Strip EXIF and save optimized image
                img.save(temp_path, optimize=True, quality=85)
                success = True
            else:
                # Direct stream copy for non-image assets
                with open(temp_path, "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)
                success = True
            break
        except Exception as e:
            time.sleep(0.1 * (attempt + 1))
            
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to write file to storage. Please try again."
        )
        
    # Rename temp to final
    os.rename(temp_path, file_path)
    
    # Recalculate size after optimization
    final_size = os.path.getsize(file_path)

    # 4. Database Persistence with Rollback Safety
    try:
        media_file = MediaFile(
            id=unique_id,
            filename=filename,
            original_filename=file.filename,
            url=relative_url,
            file_type=file.content_type or "application/octet-stream",
            file_size=final_size,
            mime_type=file.content_type,
            alt_text=alt_text,
            folder=folder,
            uploaded_by=admin.id
        )
        db.add(media_file)
        await db.flush()
        
        await log_audit_action(
            db,
            user_id=admin.id,
            action="upload_media",
            resource_type="media",
            resource_id=str(unique_id),
            details={"original_filename": file.filename, "url": relative_url}
        )
        
        return media_file
    except Exception as db_err:
        # DB rollback: clean up physical file to prevent orphan uploads
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database registration failed: {str(db_err)}. Upload rolled back."
        )

@router.get("", response_model=list[MediaFileResponse])
async def list_media(db: DbSession, admin: AdminUser, folder: Optional[str] = None):
    query = select(MediaFile)
    if folder:
        query = query.where(MediaFile.folder == folder)
    result = await db.execute(query.order_by(MediaFile.created_at.desc()))
    return result.scalars().all()

@router.delete("/{media_id}", response_model=MessageResponse)
async def delete_media(media_id: uuid.UUID, db: DbSession, admin: AdminUser):
    result = await db.execute(select(MediaFile).where(MediaFile.id == media_id))
    media = result.scalar_one_or_none()
    if not media:
        raise HTTPException(status_code=404, detail="Media file not found")
        
    # Resolve physical path
    # relative url is like /uploads/folder/filename
    parts = media.url.lstrip("/").split("/")
    if len(parts) >= 2:
        physical_path = os.path.join(UPLOAD_DIR, *parts[1:])
        if os.path.exists(physical_path):
            try:
                os.remove(physical_path)
            except Exception as e:
                pass # Continue with DB deletion even if file removal fails

    await db.delete(media)
    await db.flush()
    
    await log_audit_action(
        db,
        user_id=admin.id,
        action="delete_media",
        resource_type="media",
        resource_id=str(media_id),
        details={"url": media.url}
    )
    
    return MessageResponse(message="Media deleted successfully")
