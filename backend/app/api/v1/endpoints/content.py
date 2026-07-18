"""Content endpoints: Blog, Software, Services, Projects, Training, CMS, Support, etc."""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status
from slugify import slugify
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.core.deps import DbSession, AdminUser, CurrentUser, OptionalUser
from app.models.content import (
    BlogCategory, BlogPost, BlogComment,
    Software, SoftwareVersion, SoftwareDownload,
    Project, Service, TrainingCourse, TrainingEnrollment,
)
from app.models.cms import (
    CmsPage, CmsSection, Testimonial, Partner, Client, Faq,
    Newsletter, SiteSetting, ContactInquiry, ConsultationBooking,
    SupportTicket, TicketMessage, Notification, Career, JobApplication,
)
from app.schemas.content import *
from app.schemas.common import PaginatedResponse, MessageResponse

# ─── Blog ────────────────────────────────────────────────────────
blog_router = APIRouter(prefix="/blog", tags=["Blog"])

@blog_router.get("/categories", response_model=list[BlogCategoryResponse])
async def list_blog_categories(db: DbSession):
    result = await db.execute(select(BlogCategory).where(BlogCategory.is_active == True))
    return result.scalars().all()

@blog_router.post("/categories", response_model=BlogCategoryResponse, status_code=201)
async def create_blog_category(data: BlogCategoryCreate, db: DbSession, admin: AdminUser):
    cat = BlogCategory(name=data.name, slug=data.slug or slugify(data.name), description=data.description)
    db.add(cat)
    await db.flush()
    return cat

@blog_router.get("", response_model=PaginatedResponse[BlogPostResponse])
async def list_blog_posts(
    db: DbSession, page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100),
    category: Optional[str] = None, search: Optional[str] = None,
):
    query = select(BlogPost).where(BlogPost.status == "published")
    if category:
        query = query.join(BlogCategory).where(BlogCategory.slug == category)
    if search:
        query = query.where(BlogPost.title.ilike(f"%{search}%"))
    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar()
    query = query.order_by(BlogPost.published_at.desc()).offset((page-1)*page_size).limit(page_size)
    items = (await db.execute(query)).scalars().all()
    return {"items": items, "total": total, "page": page, "page_size": page_size, "total_pages": (total+page_size-1)//page_size}

@blog_router.get("/{slug}", response_model=BlogPostResponse)
async def get_blog_post(slug: str, db: DbSession):
    result = await db.execute(select(BlogPost).where(BlogPost.slug == slug, BlogPost.status == "published"))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    post.view_count += 1
    await db.flush()
    return post

@blog_router.post("", response_model=BlogPostResponse, status_code=201)
async def create_blog_post(data: BlogPostCreate, db: DbSession, admin: AdminUser):
    post = BlogPost(**data.model_dump(exclude_unset=True), author_id=admin.id)
    if not post.slug:
        post.slug = slugify(post.title)
    db.add(post)
    await db.flush()
    return post

# ─── Software ────────────────────────────────────────────────────
software_router = APIRouter(prefix="/software", tags=["Software"])

@software_router.get("", response_model=list[SoftwareResponse])
async def list_software(db: DbSession):
    result = await db.execute(select(Software).where(Software.is_active == True).order_by(Software.created_at.desc()))
    return result.scalars().all()

@software_router.get("/{slug}", response_model=SoftwareResponse)
async def get_software(slug: str, db: DbSession):
    result = await db.execute(select(Software).where(Software.slug == slug, Software.is_active == True))
    sw = result.scalar_one_or_none()
    if not sw:
        raise HTTPException(status_code=404, detail="Software not found")
    return sw

@software_router.post("", response_model=SoftwareResponse, status_code=201)
async def create_software(data: SoftwareCreate, db: DbSession, admin: AdminUser):
    sw = Software(**data.model_dump(exclude_unset=True))
    if not sw.slug:
        sw.slug = slugify(sw.name)
    db.add(sw)
    await db.flush()
    return sw

@software_router.get("/{software_id}/versions", response_model=list[SoftwareVersionResponse])
async def list_software_versions(software_id: UUID, db: DbSession):
    result = await db.execute(select(SoftwareVersion).where(SoftwareVersion.software_id == software_id).order_by(SoftwareVersion.created_at.desc()))
    return result.scalars().all()

@software_router.post("/{software_id}/versions", response_model=SoftwareVersionResponse, status_code=201)
async def create_software_version(software_id: UUID, data: SoftwareVersionCreate, db: DbSession, admin: AdminUser):
    ver = SoftwareVersion(**data.model_dump(), software_id=software_id)
    db.add(ver)
    await db.flush()
    return ver

# ─── Services ────────────────────────────────────────────────────
services_router = APIRouter(prefix="/services", tags=["Services"])

@services_router.get("", response_model=list[ServiceResponse])
async def list_services(db: DbSession):
    result = await db.execute(select(Service).where(Service.is_active == True).order_by(Service.sort_order))
    return result.scalars().all()

@services_router.get("/{slug}", response_model=ServiceResponse)
async def get_service(slug: str, db: DbSession):
    result = await db.execute(select(Service).where(Service.slug == slug))
    svc = result.scalar_one_or_none()
    if not svc:
        raise HTTPException(status_code=404, detail="Service not found")
    return svc

@services_router.post("", response_model=ServiceResponse, status_code=201)
async def create_service(data: ServiceCreate, db: DbSession, admin: AdminUser):
    svc = Service(**data.model_dump(exclude_unset=True))
    if not svc.slug:
        svc.slug = slugify(svc.name)
    db.add(svc)
    await db.flush()
    return svc

@services_router.post("/consultation", response_model=MessageResponse, status_code=201)
async def book_consultation(data: ConsultationBookingCreate, db: DbSession):
    booking = ConsultationBooking(**data.model_dump())
    db.add(booking)
    await db.flush()
    return MessageResponse(message="Consultation booked successfully")

# ─── Projects ────────────────────────────────────────────────────
projects_router = APIRouter(prefix="/projects", tags=["Projects"])

@projects_router.get("", response_model=list[ProjectResponse])
async def list_projects(db: DbSession, project_type: Optional[str] = None):
    query = select(Project).where(Project.is_active == True)
    if project_type:
        query = query.where(Project.project_type == project_type)
    result = await db.execute(query.order_by(Project.created_at.desc()))
    return result.scalars().all()

@projects_router.get("/{slug}", response_model=ProjectResponse)
async def get_project(slug: str, db: DbSession):
    result = await db.execute(select(Project).where(Project.slug == slug))
    proj = result.scalar_one_or_none()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    return proj

@projects_router.post("", response_model=ProjectResponse, status_code=201)
async def create_project(data: ProjectCreate, db: DbSession, admin: AdminUser):
    proj = Project(**data.model_dump(exclude_unset=True))
    if not proj.slug:
        proj.slug = slugify(proj.title)
    db.add(proj)
    await db.flush()
    return proj

# ─── Training ────────────────────────────────────────────────────
training_router = APIRouter(prefix="/training", tags=["Training"])

@training_router.get("", response_model=list[TrainingCourseResponse])
async def list_courses(db: DbSession, course_type: Optional[str] = None):
    query = select(TrainingCourse).where(TrainingCourse.is_active == True)
    if course_type:
        query = query.where(TrainingCourse.course_type == course_type)
    result = await db.execute(query.order_by(TrainingCourse.created_at.desc()))
    return result.scalars().all()

@training_router.get("/{slug}", response_model=TrainingCourseResponse)
async def get_course(slug: str, db: DbSession):
    result = await db.execute(select(TrainingCourse).where(TrainingCourse.slug == slug))
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@training_router.post("", response_model=TrainingCourseResponse, status_code=201)
async def create_course(data: TrainingCourseCreate, db: DbSession, admin: AdminUser):
    course = TrainingCourse(**data.model_dump(exclude_unset=True))
    if not course.slug:
        course.slug = slugify(course.title)
    db.add(course)
    await db.flush()
    return course

@training_router.post("/{course_id}/enroll", response_model=MessageResponse)
async def enroll_course(course_id: UUID, db: DbSession, user: CurrentUser):
    enrollment = TrainingEnrollment(course_id=course_id, user_id=user.id)
    db.add(enrollment)
    await db.flush()
    return MessageResponse(message="Enrolled successfully")

# ─── CMS ─────────────────────────────────────────────────────────
cms_router = APIRouter(prefix="/cms", tags=["CMS"])

@cms_router.get("/pages/{page_key}", response_model=CmsPageResponse)
async def get_cms_page(page_key: str, db: DbSession):
    result = await db.execute(select(CmsPage).where(CmsPage.page_key == page_key))
    page = result.scalar_one_or_none()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page

@cms_router.put("/pages/{page_key}", response_model=CmsPageResponse)
async def upsert_cms_page(page_key: str, data: CmsPageCreate, db: DbSession, admin: AdminUser):
    result = await db.execute(select(CmsPage).where(CmsPage.page_key == page_key))
    page = result.scalar_one_or_none()
    if page:
        for k, v in data.model_dump(exclude_unset=True).items():
            setattr(page, k, v)
    else:
        page = CmsPage(**data.model_dump())
        db.add(page)
    await db.flush()
    return page

@cms_router.get("/settings", response_model=dict)
async def get_site_settings(db: DbSession):
    result = await db.execute(select(SiteSetting))
    settings = result.scalars().all()
    return {s.key: s.value for s in settings}

@cms_router.put("/settings/{key}", response_model=MessageResponse)
async def update_site_setting(key: str, data: SiteSettingUpdate, db: DbSession, admin: AdminUser):
    result = await db.execute(select(SiteSetting).where(SiteSetting.key == key))
    setting = result.scalar_one_or_none()
    if setting:
        setting.value = data.value
        setting.value_type = data.value_type
        setting.group = data.group
    else:
        setting = SiteSetting(key=key, value=data.value, value_type=data.value_type, group=data.group)
        db.add(setting)
    await db.flush()
    return MessageResponse(message="Setting updated")

# ─── Testimonials, FAQs, Newsletter ─────────────────────────────
public_router = APIRouter(tags=["Public"])

@public_router.get("/testimonials", response_model=list[TestimonialResponse])
async def list_testimonials(db: DbSession):
    result = await db.execute(select(Testimonial).where(Testimonial.is_active == True).order_by(Testimonial.sort_order))
    return result.scalars().all()

@public_router.post("/testimonials", response_model=TestimonialResponse, status_code=201)
async def create_testimonial(data: TestimonialCreate, db: DbSession, admin: AdminUser):
    t = Testimonial(**data.model_dump())
    db.add(t)
    await db.flush()
    return t

@public_router.get("/faqs", response_model=list[FaqResponse])
async def list_faqs(db: DbSession, category: Optional[str] = None):
    query = select(Faq).where(Faq.is_active == True)
    if category:
        query = query.where(Faq.category == category)
    result = await db.execute(query.order_by(Faq.sort_order))
    return result.scalars().all()

@public_router.post("/faqs", response_model=FaqResponse, status_code=201)
async def create_faq(data: FaqCreate, db: DbSession, admin: AdminUser):
    faq = Faq(**data.model_dump())
    db.add(faq)
    await db.flush()
    return faq

@public_router.post("/newsletter", response_model=MessageResponse, status_code=201)
async def subscribe_newsletter(data: NewsletterCreate, db: DbSession):
    existing = await db.execute(select(Newsletter).where(Newsletter.email == data.email))
    if existing.scalar_one_or_none():
        return MessageResponse(message="Already subscribed")
    newsletter = Newsletter(email=data.email)
    db.add(newsletter)
    await db.flush()
    return MessageResponse(message="Subscribed successfully")

@public_router.post("/contact", response_model=MessageResponse, status_code=201)
async def submit_contact(data: ContactInquiryCreate, db: DbSession):
    inquiry = ContactInquiry(**data.model_dump())
    db.add(inquiry)
    await db.flush()
    return MessageResponse(message="Inquiry submitted successfully")

# ─── Careers ─────────────────────────────────────────────────────
careers_router = APIRouter(prefix="/careers", tags=["Careers"])

@careers_router.get("", response_model=list[CareerResponse])
async def list_careers(db: DbSession):
    result = await db.execute(select(Career).where(Career.is_active == True).order_by(Career.created_at.desc()))
    return result.scalars().all()

@careers_router.get("/{slug}", response_model=CareerResponse)
async def get_career(slug: str, db: DbSession):
    result = await db.execute(select(Career).where(Career.slug == slug))
    career = result.scalar_one_or_none()
    if not career:
        raise HTTPException(status_code=404, detail="Job not found")
    return career

@careers_router.post("", response_model=CareerResponse, status_code=201)
async def create_career(data: CareerCreate, db: DbSession, admin: AdminUser):
    career = Career(**data.model_dump(exclude_unset=True))
    if not career.slug:
        career.slug = slugify(career.title)
    db.add(career)
    await db.flush()
    return career

@careers_router.post("/{career_id}/apply", response_model=MessageResponse, status_code=201)
async def apply_to_job(career_id: UUID, data: JobApplicationCreate, db: DbSession):
    app = JobApplication(**data.model_dump(), career_id=career_id)
    db.add(app)
    await db.flush()
    return MessageResponse(message="Application submitted successfully")

# ─── Support Tickets ─────────────────────────────────────────────
support_router = APIRouter(prefix="/support", tags=["Support"])

@support_router.get("/tickets", response_model=list[SupportTicketResponse])
async def list_tickets(db: DbSession, user: CurrentUser):
    result = await db.execute(
        select(SupportTicket).where(SupportTicket.user_id == user.id).order_by(SupportTicket.created_at.desc())
    )
    return result.scalars().all()

@support_router.post("/tickets", response_model=SupportTicketResponse, status_code=201)
async def create_ticket(data: SupportTicketCreate, db: DbSession, user: CurrentUser):
    import random, string
    ticket_number = "TKT-" + "".join(random.choices(string.digits, k=8))
    ticket = SupportTicket(**data.model_dump(), user_id=user.id, ticket_number=ticket_number)
    db.add(ticket)
    await db.flush()
    return ticket

@support_router.post("/tickets/{ticket_id}/messages", response_model=TicketMessageResponse, status_code=201)
async def add_ticket_message(ticket_id: UUID, data: TicketMessageCreate, db: DbSession, user: CurrentUser):
    msg = TicketMessage(ticket_id=ticket_id, user_id=user.id, message=data.message)
    db.add(msg)
    await db.flush()
    return msg
