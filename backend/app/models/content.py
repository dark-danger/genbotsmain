"""Content models: Blog, Software, Projects, Services, Training."""
import uuid
from datetime import datetime, timezone
from sqlalchemy import (Boolean, Column, DateTime, Enum, ForeignKey, Integer, String, Text, Numeric, JSON, Float)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

class BlogCategory(Base):
    __tablename__ = "blog_categories"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    slug = Column(String(250), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    posts = relationship("BlogPost", back_populates="category")

class BlogPost(Base):
    __tablename__ = "blog_posts"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(300), nullable=False)
    slug = Column(String(350), unique=True, nullable=False, index=True)
    excerpt = Column(String(500), nullable=True)
    content = Column(Text, nullable=False)
    cover_image = Column(String(500), nullable=True)
    category_id = Column(UUID(as_uuid=True), ForeignKey("blog_categories.id", ondelete="SET NULL"), nullable=True)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status = Column(Enum("draft","published","archived", name="blog_status"), default="draft")
    is_featured = Column(Boolean, default=False)
    tags = Column(JSON, nullable=True)
    meta_title = Column(String(255), nullable=True)
    meta_description = Column(Text, nullable=True)
    view_count = Column(Integer, default=0)
    published_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    category = relationship("BlogCategory", back_populates="posts")
    author = relationship("User", back_populates="blog_posts")
    comments = relationship("BlogComment", back_populates="post", cascade="all, delete-orphan")

class BlogComment(Base):
    __tablename__ = "blog_comments"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = Column(UUID(as_uuid=True), ForeignKey("blog_posts.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("blog_comments.id", ondelete="CASCADE"), nullable=True)
    name = Column(String(200), nullable=True)
    email = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    is_approved = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    post = relationship("BlogPost", back_populates="comments")
    user = relationship("User", back_populates="blog_comments")
    parent = relationship("BlogComment", remote_side="BlogComment.id", backref="replies")

class Software(Base):
    __tablename__ = "software"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(300), nullable=False)
    slug = Column(String(350), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    short_description = Column(String(500), nullable=True)
    logo_url = Column(String(500), nullable=True)
    category = Column(String(100), nullable=True)
    features = Column(JSON, nullable=True)
    system_requirements = Column(JSON, nullable=True)
    screenshots = Column(JSON, nullable=True)
    documentation_url = Column(String(500), nullable=True)
    tutorial_video_url = Column(String(500), nullable=True)
    github_url = Column(String(500), nullable=True)
    is_free = Column(Boolean, default=True)
    price = Column(Numeric(10,2), nullable=True)
    is_active = Column(Boolean, default=True)
    download_count = Column(Integer, default=0)
    meta_title = Column(String(255), nullable=True)
    meta_description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    versions = relationship("SoftwareVersion", back_populates="software", cascade="all, delete-orphan", order_by="SoftwareVersion.created_at.desc()")
    downloads = relationship("SoftwareDownload", back_populates="software")

class SoftwareVersion(Base):
    __tablename__ = "software_versions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    software_id = Column(UUID(as_uuid=True), ForeignKey("software.id", ondelete="CASCADE"), nullable=False, index=True)
    version = Column(String(50), nullable=False)
    release_notes = Column(Text, nullable=True)
    changelog = Column(Text, nullable=True)
    download_url = Column(String(500), nullable=False)
    file_size = Column(String(50), nullable=True)
    platform = Column(String(50), default="Windows")
    is_latest = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    software = relationship("Software", back_populates="versions")

class SoftwareDownload(Base):
    __tablename__ = "software_downloads"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    software_id = Column(UUID(as_uuid=True), ForeignKey("software.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    version_id = Column(UUID(as_uuid=True), ForeignKey("software_versions.id", ondelete="SET NULL"), nullable=True)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    software = relationship("Software", back_populates="downloads")
    user = relationship("User", back_populates="software_downloads")

class Project(Base):
    __tablename__ = "projects"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(300), nullable=False)
    slug = Column(String(350), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    short_description = Column(String(500), nullable=True)
    cover_image = Column(String(500), nullable=True)
    gallery = Column(JSON, nullable=True)
    category = Column(String(100), nullable=True)
    client = Column(String(200), nullable=True)
    technologies = Column(JSON, nullable=True)
    status = Column(Enum("completed","running","upcoming", name="project_status"), default="completed")
    project_type = Column(Enum("client","student","internal","case_study", name="project_type"), default="client")
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    is_featured = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class Service(Base):
    __tablename__ = "services"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(300), nullable=False)
    slug = Column(String(350), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    short_description = Column(String(500), nullable=True)
    icon = Column(String(100), nullable=True)
    image_url = Column(String(500), nullable=True)
    features = Column(JSON, nullable=True)
    pricing_info = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class TrainingCourse(Base):
    __tablename__ = "training_courses"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(300), nullable=False)
    slug = Column(String(350), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    short_description = Column(String(500), nullable=True)
    cover_image = Column(String(500), nullable=True)
    category = Column(String(100), nullable=True)
    course_type = Column(Enum("online","offline","bootcamp","workshop","certification", name="course_type"), default="online")
    duration = Column(String(100), nullable=True)
    level = Column(Enum("beginner","intermediate","advanced", name="course_level"), default="beginner")
    price = Column(Numeric(10,2), nullable=True)
    syllabus = Column(JSON, nullable=True)
    prerequisites = Column(JSON, nullable=True)
    instructor = Column(String(200), nullable=True)
    max_students = Column(Integer, nullable=True)
    enrolled_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    starts_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    enrollments = relationship("TrainingEnrollment", back_populates="course")

class TrainingEnrollment(Base):
    __tablename__ = "training_enrollments"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(UUID(as_uuid=True), ForeignKey("training_courses.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(Enum("enrolled","completed","dropped", name="enrollment_status"), default="enrolled")
    enrolled_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime(timezone=True), nullable=True)
    course = relationship("TrainingCourse", back_populates="enrollments")
    user = relationship("User", back_populates="training_enrollments")
