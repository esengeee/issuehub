"""
Seed script to populate the database with demo data.

Usage: python seed.py
"""

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models import User, Project, ProjectMember, ProjectRole, Issue, IssueStatus, IssuePriority, Comment
import random

# Create all tables
Base.metadata.create_all(bind=engine)


def seed_database():
    db: Session = SessionLocal()

    try:
        # Clear existing data (optional)
        print("Clearing existing data...")
        db.query(Comment).delete()
        db.query(Issue).delete()
        db.query(ProjectMember).delete()
        db.query(Project).delete()
        db.query(User).delete()
        db.commit()

        # Create users
        print("Creating users...")
        users = [
            User(
                name="Alice Johnson",
                email="alice@example.com",
                password_hash=get_password_hash("password123")
            ),
            User(
                name="Bob Smith",
                email="bob@example.com",
                password_hash=get_password_hash("password123")
            ),
            User(
                name="Charlie Brown",
                email="charlie@example.com",
                password_hash=get_password_hash("password123")
            ),
        ]

        for user in users:
            db.add(user)
        db.commit()
        for user in users:
            db.refresh(user)
        print(f"Created {len(users)} users")

        # Create projects
        print("Creating projects...")
        projects = [
            Project(
                name="E-commerce Platform",
                key="ECOM",
                description="Main e-commerce platform development"
            ),
            Project(
                name="Mobile App",
                key="MOBILE",
                description="iOS and Android mobile applications"
            ),
        ]

        for project in projects:
            db.add(project)
        db.commit()
        for project in projects:
            db.refresh(project)
        print(f"Created {len(projects)} projects")

        # Add project members
        print("Adding project members...")
        # Alice is maintainer of both projects
        db.add(ProjectMember(project_id=projects[0].id, user_id=users[0].id, role=ProjectRole.MAINTAINER))
        db.add(ProjectMember(project_id=projects[1].id, user_id=users[0].id, role=ProjectRole.MAINTAINER))
        # Bob is member of first project
        db.add(ProjectMember(project_id=projects[0].id, user_id=users[1].id, role=ProjectRole.MEMBER))
        # Charlie is member of second project
        db.add(ProjectMember(project_id=projects[1].id, user_id=users[2].id, role=ProjectRole.MEMBER))
        db.commit()
        print("Added project members")

        # Create issues
        print("Creating issues...")
        issue_templates = [
            ("Fix login bug", "Users are unable to log in with valid credentials", IssuePriority.CRITICAL, IssueStatus.OPEN),
            ("Add payment gateway", "Integrate Stripe payment processing", IssuePriority.HIGH, IssueStatus.IN_PROGRESS),
            ("Improve UI responsiveness", "Make the UI mobile-friendly", IssuePriority.MEDIUM, IssueStatus.OPEN),
            ("Add search functionality", "Implement product search with filters", IssuePriority.HIGH, IssueStatus.IN_PROGRESS),
            ("Fix broken images", "Product images not loading on detail page", IssuePriority.MEDIUM, IssueStatus.RESOLVED),
            ("Update documentation", "Add API documentation for new endpoints", IssuePriority.LOW, IssueStatus.OPEN),
            ("Performance optimization", "Optimize database queries for better performance", IssuePriority.MEDIUM, IssueStatus.OPEN),
            ("Add user notifications", "Implement email and push notifications", IssuePriority.HIGH, IssueStatus.OPEN),
            ("Fix cart calculation", "Shopping cart total is incorrect with discounts", IssuePriority.CRITICAL, IssueStatus.RESOLVED),
            ("Add product reviews", "Allow users to leave reviews and ratings", IssuePriority.LOW, IssueStatus.OPEN),
        ]

        issues = []
        for i, (title, description, priority, status) in enumerate(issue_templates):
            project = projects[i % len(projects)]
            reporter = random.choice([u for u in users if any(pm.user_id == u.id and pm.project_id == project.id for pm in db.query(ProjectMember).all())])

            issue = Issue(
                project_id=project.id,
                title=title,
                description=description,
                priority=priority,
                status=status,
                reporter_id=reporter.id,
                assignee_id=users[i % len(users)].id if i % 3 == 0 else None
            )
            db.add(issue)
            issues.append(issue)

        db.commit()
        for issue in issues:
            db.refresh(issue)
        print(f"Created {len(issues)} issues")

        # Create comments
        print("Creating comments...")
        comment_templates = [
            "I'm looking into this issue now.",
            "This seems to be related to the recent deployment.",
            "Can you provide more details about how to reproduce this?",
            "I've pushed a fix for this. Please test it out.",
            "This is working as expected now. Closing the issue.",
            "We should prioritize this for the next sprint.",
        ]

        comments_count = 0
        for issue in issues[:5]:  # Add comments to first 5 issues
            num_comments = random.randint(1, 3)
            for _ in range(num_comments):
                comment = Comment(
                    issue_id=issue.id,
                    author_id=random.choice(users).id,
                    body=random.choice(comment_templates)
                )
                db.add(comment)
                comments_count += 1

        db.commit()
        print(f"Created {comments_count} comments")

        print("\n✅ Database seeded successfully!")
        print("\nDemo Users:")
        print("  Email: alice@example.com, Password: password123 (Maintainer)")
        print("  Email: bob@example.com, Password: password123 (Member)")
        print("  Email: charlie@example.com, Password: password123 (Member)")

    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
