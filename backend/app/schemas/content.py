"""Content schemas: Blog, Software, Projects, Services, Training, CMS, Support."""
from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field

# Blog
class BlogPostCreate(BaseModel):
    title: str = Field(..., max_length=300)
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: str
    cover_image: Optional[str] = None
    category_id: Optional[UUID] = None
    status: str = "draft"
    is_featured: bool = False
    tags: Optional[list[str]] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None

class BlogPostResponse(BaseModel):
    id: UUID
    title: str
    slug: str
    excerpt: Optional[str] = None
    content: str
    cover_image: Optional[str] = None
    category_id: Optional[UUID] = None
    status: str
    is_featured: bool
    tags: Optional[list[str]] = None
    view_count: int
    published_at: Optional[datetime] = None
    created_at: datetime
    model_config = {"from_attributes": True}

class BlogCategoryCreate(BaseModel):
    name: str
    slug: Optional[str] = None
    description: Optional[str] = None

class BlogCategoryResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    description: Optional[str] = None
    is_active: bool
    model_config = {"from_attributes": True}

class BlogCommentCreate(BaseModel):
    content: str
    parent_id: Optional[UUID] = None

class BlogCommentResponse(BaseModel):
    id: UUID
    content: str
    is_approved: bool
    created_at: datetime
    model_config = {"from_attributes": True}

# Software
class SoftwareCreate(BaseModel):
    name: str
    slug: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    logo_url: Optional[str] = None
    category: Optional[str] = None
    features: Optional[list[str]] = None
    system_requirements: Optional[dict] = None
    screenshots: Optional[list[str]] = None
    documentation_url: Optional[str] = None
    tutorial_video_url: Optional[str] = None
    github_url: Optional[str] = None
    is_free: bool = True
    price: Optional[Decimal] = None
    is_active: bool = True

class SoftwareResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    description: Optional[str] = None
    short_description: Optional[str] = None
    logo_url: Optional[str] = None
    category: Optional[str] = None
    features: Optional[list[str]] = None
    system_requirements: Optional[dict] = None
    screenshots: Optional[list[str]] = None
    documentation_url: Optional[str] = None
    tutorial_video_url: Optional[str] = None
    github_url: Optional[str] = None
    is_free: bool
    price: Optional[Decimal] = None
    download_count: int
    is_active: bool
    created_at: datetime
    model_config = {"from_attributes": True}

class SoftwareVersionCreate(BaseModel):
    version: str
    release_notes: Optional[str] = None
    changelog: Optional[str] = None
    download_url: str
    file_size: Optional[str] = None
    platform: str = "Windows"
    is_latest: bool = False

class SoftwareVersionResponse(BaseModel):
    id: UUID
    version: str
    release_notes: Optional[str] = None
    changelog: Optional[str] = None
    download_url: str
    file_size: Optional[str] = None
    platform: str
    is_latest: bool
    created_at: datetime
    model_config = {"from_attributes": True}

# Projects
class ProjectCreate(BaseModel):
    title: str
    slug: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    cover_image: Optional[str] = None
    gallery: Optional[list[str]] = None
    category: Optional[str] = None
    client: Optional[str] = None
    technologies: Optional[list[str]] = None
    status: str = "completed"
    project_type: str = "client"
    is_featured: bool = False

class ProjectResponse(BaseModel):
    id: UUID
    title: str
    slug: str
    description: Optional[str] = None
    short_description: Optional[str] = None
    cover_image: Optional[str] = None
    gallery: Optional[list[str]] = None
    category: Optional[str] = None
    client: Optional[str] = None
    technologies: Optional[list[str]] = None
    status: str
    project_type: str
    is_featured: bool
    created_at: datetime
    model_config = {"from_attributes": True}

# Services
class ServiceCreate(BaseModel):
    name: str
    slug: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    icon: Optional[str] = None
    image_url: Optional[str] = None
    features: Optional[list[str]] = None
    pricing_info: Optional[str] = None
    is_active: bool = True
    sort_order: int = 0

class ServiceResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    description: Optional[str] = None
    short_description: Optional[str] = None
    icon: Optional[str] = None
    image_url: Optional[str] = None
    features: Optional[list[str]] = None
    pricing_info: Optional[str] = None
    is_active: bool
    sort_order: int
    created_at: datetime
    model_config = {"from_attributes": True}

# Training
class TrainingCourseCreate(BaseModel):
    title: str
    slug: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    cover_image: Optional[str] = None
    category: Optional[str] = None
    course_type: str = "online"
    duration: Optional[str] = None
    level: str = "beginner"
    price: Optional[Decimal] = None
    syllabus: Optional[list[dict]] = None
    prerequisites: Optional[list[str]] = None
    instructor: Optional[str] = None
    max_students: Optional[int] = None

class TrainingCourseResponse(BaseModel):
    id: UUID
    title: str
    slug: str
    description: Optional[str] = None
    short_description: Optional[str] = None
    cover_image: Optional[str] = None
    category: Optional[str] = None
    course_type: str
    duration: Optional[str] = None
    level: str
    price: Optional[Decimal] = None
    enrolled_count: int
    is_active: bool
    is_featured: bool
    created_at: datetime
    model_config = {"from_attributes": True}

# CMS
class CmsPageCreate(BaseModel):
    page_key: str
    title: str
    content: Optional[dict] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None

class CmsPageResponse(BaseModel):
    id: UUID
    page_key: str
    title: str
    content: Optional[dict] = None
    is_active: bool
    created_at: datetime
    model_config = {"from_attributes": True}

class CmsSectionCreate(BaseModel):
    section_key: str
    title: Optional[str] = None
    content: Optional[dict] = None
    is_active: bool = True
    sort_order: int = 0

class CmsSectionResponse(BaseModel):
    id: UUID
    section_key: str
    title: Optional[str] = None
    content: Optional[dict] = None
    is_active: bool
    sort_order: int
    model_config = {"from_attributes": True}

# Support
class SupportTicketCreate(BaseModel):
    subject: str
    description: str
    category: str = "General"
    priority: str = "medium"

class SupportTicketResponse(BaseModel):
    id: UUID
    ticket_number: str
    subject: str
    description: str
    category: str
    priority: str
    status: str
    created_at: datetime
    model_config = {"from_attributes": True}

class TicketMessageCreate(BaseModel):
    message: str

class TicketMessageResponse(BaseModel):
    id: UUID
    message: str
    is_staff_reply: bool
    created_at: datetime
    model_config = {"from_attributes": True}

# Testimonials, Partners, etc.
class TestimonialCreate(BaseModel):
    name: str
    designation: Optional[str] = None
    company: Optional[str] = None
    avatar_url: Optional[str] = None
    content: str
    rating: int = 5

class TestimonialResponse(BaseModel):
    id: UUID
    name: str
    designation: Optional[str] = None
    company: Optional[str] = None
    avatar_url: Optional[str] = None
    content: str
    rating: int
    is_active: bool
    model_config = {"from_attributes": True}

class FaqCreate(BaseModel):
    question: str
    answer: str
    category: str = "General"
    sort_order: int = 0

class FaqResponse(BaseModel):
    id: UUID
    question: str
    answer: str
    category: str
    is_active: bool
    sort_order: int
    model_config = {"from_attributes": True}

class NewsletterCreate(BaseModel):
    email: str

class ContactInquiryCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    subject: Optional[str] = None
    message: str

class ConsultationBookingCreate(BaseModel):
    name: str
    email: str
    phone: str
    company: Optional[str] = None
    service_id: Optional[UUID] = None
    message: Optional[str] = None
    preferred_date: Optional[datetime] = None

class CareerCreate(BaseModel):
    title: str
    slug: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    job_type: str = "full_time"
    experience: Optional[str] = None
    description: str
    requirements: Optional[list[str]] = None
    benefits: Optional[list[str]] = None
    salary_range: Optional[str] = None

class CareerResponse(BaseModel):
    id: UUID
    title: str
    slug: str
    department: Optional[str] = None
    location: Optional[str] = None
    job_type: str
    experience: Optional[str] = None
    description: str
    requirements: Optional[list[str]] = None
    benefits: Optional[list[str]] = None
    salary_range: Optional[str] = None
    is_active: bool
    created_at: datetime
    model_config = {"from_attributes": True}

class JobApplicationCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    cover_letter: Optional[str] = None

class SiteSettingUpdate(BaseModel):
    value: str
    value_type: str = "string"
    group: str = "general"
