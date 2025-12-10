# Student Management System

A full-stack student management system with modern UI and complete CRUD functionality.


##  🚀 Live Demos
- **Frontend (Vercel):** https://student-management-system-frontend-lac.vercel.app/ 
- **Backend API (Render):**
- 
## Features
✅ Complete CRUD Operations
✅ Modern Glassmorphism UI
✅ Dark/Light Mode Toggle
✅ Export to CSV
✅ Search & Pagination
✅ Responsive Design
✅ MongoDB Atlas Database

## 🛠️ Tech Stack
- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Deployment**: Vercel (Frontend), Render (Backend)

## 📁 Project Structure
student-management-system/
│
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   └── studentController.js
│   ├── models/
│   │   └── Student.js
│   ├── routes/
│   │   └── studentRoutes.js
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── assets/
    │   ├── icons/
    │   └── images/
    ├── css/
    │   └── style.css
    ├── js/
    │   └── script.js
    └── index.html


## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MongoDB Atlas account
- Git

### Installation
1. Clone the repository
2. Setup Backend
3. Setup Frontend
4. Run the application

## 🔗 API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/students | Get all students |
| POST | /api/students | Create student |
| PUT | /api/students/:id | Update student |
| DELETE | /api/students/:id | Delete student |
| GET | /api/health | Health check |

## 📄 License
MIT
