# Quick Start Guide

Get IssueHub up and running in 5 minutes!

## Step 1: Install Backend Dependencies

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

## Step 2: Seed Demo Data (Optional but Recommended)

```bash
python seed.py
```

This creates 3 demo users and sample projects with issues.

## Step 3: Start the Backend

```bash
uvicorn main:app --reload
```

Backend will run at http://localhost:8000
API docs available at http://localhost:8000/docs

## Step 4: Install Frontend Dependencies

Open a new terminal:

```bash
cd frontend
npm install
```

## Step 5: Start the Frontend

```bash
npm run dev
```

Frontend will run at http://localhost:3000

## Step 6: Login

Open http://localhost:3000 and login with:

**Email:** alice@example.com
**Password:** password123

Or create a new account!

## That's It!

You now have a fully functional bug tracker running locally. Start creating projects and tracking issues!

## Running Tests

```bash
cd backend
pytest
```

## Need Help?

Check the main [README.md](README.md) for detailed documentation.
