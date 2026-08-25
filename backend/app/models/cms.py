"""CMS and system models: Pages, Settings, Media, Support, Analytics."""
import uuid
from datetime import datetime, timezone
from sqlalchemy import (Boolean, Column, DateTime, Enum, ForeignKey, Integer, String, Text, JSON)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base

class CmsPage(Base):
    __tablename__ = "cms_pages"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    page_key = Column(String(100), unique=True, nullable=False, index=True)
    title = Column(String(300), nullable=False)
    content = Column(JSON, nullable=True)
    meta_title = Column(String(255), nullable=True)
    meta_description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    sections = relationship("CmsSection", back_populates="page", cascade="all, delete-orphan", order_by="CmsSection.sort_order")

class CmsSection(Base):
    __tablename__ = "cms_sections"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    page_id = Column(UUID(as_uuid=True), ForeignKey("cms_pages.id", ondelete="CASCADE"), nullable=False, index=True)
    section_key = Column(String(100), nullable=False)
    title = Column(String(300), nullable=True)
    content = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    page = relationship("CmsPage", back_populates="sections")

class MediaFile(Base):
    __tablename__ = "media_files"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    filename = Column(String(300), nullable=False)
    original_filename = Column(String(300), nullable=False)
    url = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size = Column(Integer, nullable=True)
    mime_type = Column(String(100), nullable=True)
    alt_text = Column(String(255), nullable=True)
    folder = Column(String(200), default="general")
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class Testimonial(Base):
    __tablename__ = "testimonials"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    designation = Column(String(200), nullable=True)
    company = Column(String(200), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    content = Column(Text, nullable=False)
    rating = Column(Integer, default=5)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class Partner(Base):
    __tablename__ = "partners"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    logo_url = Column(String(500), nullable=True)
    website = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class Client(Base):
    __tablename__ = "clients"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    logo_url = Column(String(500), nullable=True)
    website = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class Faq(Base):
    __tablename__ = "faqs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    category = Column(String(100), default="General")
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class Newsletter(Base):
    __tablename__ = "newsletters"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    is_active = Column(Boolean, default=True)
    subscribed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    unsubscribed_at = Column(DateTime(timezone=True), nullable=True)

class SiteSetting(Base):
    __tablename__ = "site_settings"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    key = Column(String(100), unique=True, nullable=False, index=True)
    value = Column(Text, nullable=True)
    value_type = Column(String(20), default="string")
    group = Column(String(50), default="general")
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class SocialLink(Base):
    __tablename__ = "social_links"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    platform = Column(String(50), nullable=False)
    url = Column(String(500), nullable=False)
    icon = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)

class SupportTicket(Base):
    __tablename__ = "support_tickets"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticket_number = Column(String(20), unique=True, nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    subject = Column(String(300), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), default="General")
    priority = Column(Enum("low","medium","high","urgent", name="ticket_priority"), default="medium")
    status = Column(Enum("open","in_progress","resolved","closed", name="ticket_status"), default="open")
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    user = relationship("User", back_populates="support_tickets", foreign_keys=[user_id])
    messages = relationship("TicketMessage", back_populates="ticket", cascade="all, delete-orphan", order_by="TicketMessage.created_at")

class TicketMessage(Base):
    __tablename__ = "ticket_messages"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticket_id = Column(UUID(as_uuid=True), ForeignKey("support_tickets.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    message = Column(Text, nullable=False)
    is_staff_reply = Column(Boolean, default=False)
    attachment_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    ticket = relationship("SupportTicket", back_populates="messages")

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(300), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="info")
    is_read = Column(Boolean, default=False)
    link = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    user = relationship("User", back_populates="notifications")

class ContactInquiry(Base):
    __tablename__ = "contact_inquiries"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    subject = Column(String(300), nullable=True)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    is_replied = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class ConsultationBooking(Base):
    __tablename__ = "consultation_bookings"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=False)
    company = Column(String(200), nullable=True)
    service_id = Column(UUID(as_uuid=True), ForeignKey("services.id", ondelete="SET NULL"), nullable=True)
    message = Column(Text, nullable=True)
    preferred_date = Column(DateTime(timezone=True), nullable=True)
    status = Column(Enum("pending","confirmed","completed","cancelled", name="booking_status"), default="pending")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(100), nullable=False)
    resource_id = Column(String(100), nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(200), nullable=False)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    user = relationship("User", back_populates="activity_logs")

class SeoMetadata(Base):
    __tablename__ = "seo_metadata"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    page_path = Column(String(500), unique=True, nullable=False, index=True)
    title = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    keywords = Column(Text, nullable=True)
    og_title = Column(String(255), nullable=True)
    og_description = Column(Text, nullable=True)
    og_image = Column(String(500), nullable=True)
    twitter_card = Column(String(50), default="summary_large_image")
    canonical_url = Column(String(500), nullable=True)
    structured_data = Column(JSON, nullable=True)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class Career(Base):
    __tablename__ = "careers"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(300), nullable=False)
    slug = Column(String(350), unique=True, nullable=False, index=True)
    department = Column(String(100), nullable=True)
    location = Column(String(200), nullable=True)
    job_type = Column(Enum("full_time","part_time","contract","internship", name="job_type"), default="full_time")
    experience = Column(String(100), nullable=True)
    description = Column(Text, nullable=False)
    requirements = Column(JSON, nullable=True)
    benefits = Column(JSON, nullable=True)
    salary_range = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    applications = relationship("JobApplication", back_populates="career")

class JobApplication(Base):
    __tablename__ = "job_applications"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    career_id = Column(UUID(as_uuid=True), ForeignKey("careers.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    resume_url = Column(String(500), nullable=True)
    cover_letter = Column(Text, nullable=True)
    status = Column(Enum("received","reviewing","shortlisted","rejected","hired", name="application_status"), default="received")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    career = relationship("Career", back_populates="applications")
