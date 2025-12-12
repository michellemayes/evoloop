import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Float, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    plan = Column(String(50), default="free", nullable=False)
    settings = Column(JSON, default=dict)

    sites = relationship("Site", back_populates="user", cascade="all, delete-orphan")


class Site(Base):
    __tablename__ = "sites"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    url = Column(String(2048), nullable=False)
    status = Column(String(50), default="analyzing", nullable=False)
    autonomy_mode = Column(String(50), default="training_wheels", nullable=False)
    approvals_remaining = Column(Integer, default=5)
    brand_constraints = Column(JSON, default=dict)
    image_generation_enabled = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="sites")
    variants = relationship("Variant", back_populates="site", cascade="all, delete-orphan")
    conversion_goals = relationship("ConversionGoal", back_populates="site", cascade="all, delete-orphan")
    events = relationship("Event", back_populates="site", cascade="all, delete-orphan")


class Variant(Base):
    __tablename__ = "variants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    site_id = Column(UUID(as_uuid=True), ForeignKey("sites.id"), nullable=False)
    parent_variant_id = Column(UUID(as_uuid=True), ForeignKey("variants.id"), nullable=True)
    patch = Column(JSON, default=dict)
    screenshot_url = Column(String(2048), nullable=True)
    generation_reasoning = Column(Text, nullable=True)
    status = Column(String(50), default="pending_review", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    killed_at = Column(DateTime, nullable=True)

    site = relationship("Site", back_populates="variants")
    parent = relationship("Variant", remote_side=[id], backref="children")
    stats = relationship("ExperimentStats", back_populates="variant", uselist=False, cascade="all, delete-orphan")


class ExperimentStats(Base):
    __tablename__ = "experiment_stats"

    variant_id = Column(UUID(as_uuid=True), ForeignKey("variants.id"), primary_key=True)
    visitors = Column(Integer, default=0, nullable=False)
    conversions = Column(Integer, default=0, nullable=False)
    alpha = Column(Float, default=1.0, nullable=False)
    beta = Column(Float, default=1.0, nullable=False)
    prob_best = Column(Float, default=0.0, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    variant = relationship("Variant", back_populates="stats")


class Event(Base):
    __tablename__ = "events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    site_id = Column(UUID(as_uuid=True), ForeignKey("sites.id"), nullable=False, index=True)
    variant_id = Column(UUID(as_uuid=True), ForeignKey("variants.id"), nullable=False)
    visitor_id = Column(String(255), nullable=False, index=True)
    event_type = Column(String(50), nullable=False)
    event_metadata = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    site = relationship("Site", back_populates="events")
    variant = relationship("Variant")


class ConversionGoal(Base):
    __tablename__ = "conversion_goals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    site_id = Column(UUID(as_uuid=True), ForeignKey("sites.id"), nullable=False)
    type = Column(String(50), nullable=False)
    config = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    site = relationship("Site", back_populates="conversion_goals")
