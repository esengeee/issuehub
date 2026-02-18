# IssueHub - A Lightweight Bug Tracker

IssueHub is a minimal yet powerful bug tracking application designed for teams to create projects, file issues, comment on them, and track their status. Built with modern technologies and clean architecture, it provides a solid foundation for issue management.

## Tech Stack

### Backend
- **FastAPI** - Modern, fast Python web framework with automatic API documentation
- **SQLAlchemy** - SQL toolkit and ORM for database operations
- **Alembic** - Database migration tool
- **SQLite** - Lightweight file-based database (easily swappable with PostgreSQL)
- **Pydantic** - Data validation using Python type hints
- **python-jose** - JWT token creation and verification
- **passlib** - Secure password hashing with bcrypt
- **pytest** - Testing framework

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Axios** - HTTP client for API calls
- **CSS** - Custom styling (no heavy UI frameworks for minimal bundle size)

## Architecture

### Backend Structure
```
backend/
├── app/
│   ├── api/          # API route handlers
│   │   ├── auth.py       # Authentication endpoints
│   │   ├── projects.py   # Project CRUD and members
│   │   ├── issues.py     # Issue CRUD with filtering/search
│   │   └── comments.py   # Comment endpoints
│   ├── core/         # Core functionality
│   │   ├── config.py     # Configuration management
│   │   ├── database.py   # Database connection
│   │   ├── security.py   # JWT and password utilities
│   │   └── deps.py       # FastAPI dependencies
│   ├── models/       # SQLAlchemy database models
│   │   ├── user.py
│   │   ├── project.py
│   │   ├── issue.py
│   │   └── comment.py
│   └── schemas/      # Pydantic schemas for validation
│       ├── auth.py
│       ├── project.py
│       ├── issue.py
│       ├── comment.py
│       └── error.py
├── tests/            # Backend tests
├── alembic/          # Database migrations
├── main.py           # FastAPI application entry point
├── seed.py           # Demo data seeder
└── requirements.txt  # Python dependencies
```

### Frontend Structure
```
frontend/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── login/        # Login page
│   │   ├── signup/       # Signup page
│   │   ├── projects/     # Projects list and detail
│   │   └── issues/       # Issue detail with comments
│   ├── components/       # Reusable components
│   │   └── Navbar.tsx
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx
│   ├── lib/              # Utilities
│   │   └── api.ts        # API client
│   └── types/            # TypeScript types
│       └── index.ts
├── package.json
├── tsconfig.json
└── next.config.js
```

## Features

### Core Functionality
- ✅ **User Authentication** - Signup, login, logout with JWT tokens
- ✅ **Project Management** - Create projects, add members with roles (Member/Maintainer)
- ✅ **Issue Tracking** - CRUD operations on issues with rich metadata
- ✅ **Filtering & Search** - Filter by status, priority, assignee; search by title; sort by date/priority/status
- ✅ **Comments** - Threaded discussions on issues
- ✅ **Role-Based Permissions** - Users can update their own issues, maintainers can manage all
- ✅ **Responsive UI** - Clean, mobile-friendly interface
- ✅ **Form Validation** - Client and server-side validation
- ✅ **Error Handling** - Structured error responses
- ✅ **API Documentation** - Auto-generated with FastAPI/OpenAPI

### User Roles
- **User** - Can create/update issues they reported, comment, view all issues in their projects
- **Project Maintainer** - Can update/assign/close any issue, manage project membership

## Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 18+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment:**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # Mac/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and update values:
   ```env
   DATABASE_URL=sqlite:///./issuehub.db
   SECRET_KEY=your-super-secret-key-change-this
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```

5. **Run migrations:**
   ```bash
   alembic upgrade head
   ```

   Note: For fresh setups, tables are also auto-created via SQLAlchemy on first run. The initial migration documents the current schema state.

6. **Seed demo data (optional):**
   ```bash
   python seed.py
   ```

   This creates 3 demo users:
   - alice@example.com / password123 (Maintainer)
   - bob@example.com / password123 (Member)
   - charlie@example.com / password123 (Member)

7. **Run the backend server:**
   ```bash
   uvicorn main:app --reload
   ```

   Backend will be available at `http://localhost:8000`
   API docs at `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file (optional):**
   ```bash
   # Create .env.local file
   echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

   Frontend will be available at `http://localhost:3000`

### Database Migrations

**Create a new migration after model changes:**
```bash
cd backend
alembic revision --autogenerate -m "Description of changes"
alembic upgrade head
```

**Rollback last migration:**
```bash
alembic downgrade -1
```

### Running Tests

**Backend tests:**
```bash
cd backend
pytest
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Authenticate user
- `GET /api/auth/me` - Get current user profile

### Projects
- `GET /api/projects` - List user's projects
- `POST /api/projects` - Create project
- `GET /api/projects/{id}` - Get project details
- `POST /api/projects/{id}/members` - Add project member

### Issues
- `GET /api/projects/{id}/issues` - List issues (with filters: q, status, priority, assignee, sort)
- `POST /api/projects/{id}/issues` - Create issue
- `GET /api/issues/{id}` - Get issue details
- `PATCH /api/issues/{id}` - Update issue
- `DELETE /api/issues/{id}` - Delete issue

### Comments
- `GET /api/issues/{id}/comments` - List comments
- `POST /api/issues/{id}/comments` - Add comment

Full API documentation available at `http://localhost:8000/docs` when backend is running.

## Tech Choices & Trade-offs

### Why FastAPI?
- ✅ Fast development with automatic API docs
- ✅ Built-in data validation with Pydantic
- ✅ Excellent async support
- ✅ Type hints for better code quality
- ❌ Smaller ecosystem compared to Django

### Why SQLite?
- ✅ Zero configuration, perfect for local development
- ✅ Single file database, easy to share/backup
- ✅ Sufficient for small-medium teams
- ❌ Not recommended for high-concurrency production
- 💡 Easy migration path to PostgreSQL (change DATABASE_URL)

### Why Next.js?
- ✅ Great developer experience with App Router
- ✅ Server and client components
- ✅ Built-in routing
- ✅ TypeScript support out of the box
- ❌ More complex than plain React for small apps

### Why No UI Framework?
- ✅ Smaller bundle size
- ✅ Full control over styling
- ✅ No learning curve
- ❌ More CSS to write
- ❌ Less consistent components

## Known Limitations & Future Improvements

### Current Limitations
1. **No pagination** - All issues/comments loaded at once (fine for small datasets)
2. **No real-time updates** - Users must refresh to see changes
3. **Basic auth** - No OAuth/SSO, password reset, or 2FA
4. **No file attachments** - Can't upload screenshots or files
5. **Limited notifications** - No email or push notifications
6. **No audit log** - Can't track who changed what
7. **Basic search** - Only searches in title, not description or comments
8. **No issue relationships** - Can't link related issues or create subtasks

### Future Enhancements
- **Pagination** - Add cursor-based pagination for large datasets
- **WebSockets** - Real-time updates using WebSocket connections
- **File Uploads** - S3/local storage for attachments
- **Advanced Search** - Full-text search across all fields
- **Email Notifications** - Alert users of mentions, assignments
- **Activity Feed** - Timeline of project activity
- **Issue Templates** - Predefined issue formats
- **Milestones & Sprints** - Agile project management features
- **Dashboard & Analytics** - Charts and metrics
- **Export/Import** - CSV/JSON data portability
- **Dark Mode** - Theme toggle
- **Mobile Apps** - Native iOS/Android apps

## Security Considerations

### Implemented
- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Input validation with Pydantic
- ✅ SQL injection protection via SQLAlchemy ORM
- ✅ CORS configuration
- ✅ Role-based access control

### Production Recommendations
- Use PostgreSQL instead of SQLite
- Enable HTTPS/TLS
- Set strong SECRET_KEY
- Implement rate limiting
- Add CSRF protection
- Enable API request logging
- Regular security audits
- Use environment-specific configs

## Contributing

This is a demo project. Feel free to fork and extend it for your needs!

## License

MIT License - Feel free to use this project for learning or as a starting point for your own bug tracker.

---

**Built with ❤️ using FastAPI and Next.js**
