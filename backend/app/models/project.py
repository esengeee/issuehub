from sqlalchemy import Column, Integer, String, DateTime, Date, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base


class ProjectRole(str, enum.Enum):
    MEMBER = "member"
    MAINTAINER = "maintainer"


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    key = Column(String, unique=True, index=True, nullable=False)
    description = Column(String)
    start_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    members = relationship("ProjectMember", back_populates="project")
    issues = relationship("Issue", back_populates="project")


class ProjectMember(Base):
    __tablename__ = "project_members"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(Enum(ProjectRole), nullable=False, default=ProjectRole.MEMBER)

    # Relationships
    project = relationship("Project", back_populates="members")
    user = relationship("User")
