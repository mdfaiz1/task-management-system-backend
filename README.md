# 🗂️ Task Management System - Backend

A powerful and scalable **Task Management System** backend built using **Node.js**, **Express.js**, **MongoDB**, **Redis**, and **BullMQ**.  
It supports **task creation**, **automatic reminders**, **team collaboration**, and **email notifications** using background jobs.

---

## 🚀 Tech Stack

| Technology | Description |
|-------------|-------------|
| **Node.js** | JavaScript runtime environment |
| **Express.js** | Web framework for building RESTful APIs |
| **MongoDB** | NoSQL database for storing data |
| **Mongoose** | ODM for MongoDB |
| **Redis** | In-memory data store for queues and caching |
| **BullMQ** | Job queue for scheduling and background processing |
| **Nodemailer / Brevo API** | Sending automated email notifications |
| **dotenv** | Environment variable management |

---

## 📁 Project Structure

```
task-management-backend/
│
├── src/
|   ├── BullMqQueus/             # Bull MQ Queues
│   ├── config/
│   │   ├── db.js                # MongoDB connection
│   │   ├── redis.js             # Redis connection
│   │
│   ├── controllers/             # Controllers for handling requests
│   │   ├── task.controller.js
│   │   ├── auth.controller.js
│   │   ├── team.controller.js
│   │
|   ├── Middelwares/
|   |   ├── auth.middlewares.js
|   |   └── multer.middlewares.js
│   │   
│   ├── models/                  # Database models (Mongoose)
│   │   ├── Task.model.js
│   │   ├── User.model.js
│   │   ├── Team.model.js
|   |   ├── Invitation.model.js
│   │
│   ├── jobs/                    # BullMQ job processors
│   │   ├── reminderJob.js
│   │   └── emailJob.js
│   │
│   │
│   ├── routes/                  # Express route definitions
│   │   ├── taskRoutes.js
│   │   ├── AuthRoutes.js
│   │   ├── teamRoutes.js
│   │
│   ├── utils/                   # Helper functions
│   │   ├── geminiClient.js
│   │   └── generateOtp.js
│   │
│   ├── app.js                   # Express app configuration
│
├── .env                         # Environment variables
├── .gitignore
├── package.json
├── index.js
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/task-management-backend.git
cd task-management-backend
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Setup Environment Variables
Create a `.env` file in the root directory and add the following:

```env
# =====================================
# 🌐 SERVER CONFIGURATION
# =====================================
PORT=8002

# =====================================
# 🗄️ DATABASE (MongoDB Atlas)
# =====================================
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>.mongodb.net
DB_NAME=TaskManagement

# =====================================
# 🔐 AUTHENTICATION (JWT)
# =====================================
JWT_SECRET=<your_jwt_secret_key>
JWT_EXPIRES_IN=1d

# =====================================
# 🧰 REDIS / BULLMQ CONFIGURATION
# =====================================
REDIS_URL=<your_redis_url>
REDIS_PASS=<your_redis_password>

# =====================================
# 🤖 GOOGLE GEMINI AI CONFIGURATION
# =====================================
GEMINI_API_KEY=<your_gemini_api_key>

# =====================================
# 📬 EMAIL SERVICE (BREVO / NODEMAILER)
# =====================================
BREVO_API_KEY=<your_brevo_api_key>

# =====================================
# 🧪 OPTIONAL LOCAL DEVELOPMENT CONFIG
# =====================================
# Uncomment below lines when running locally instead of cloud
# PORT=5000
# MONGO_URI=mongodb://localhost:27017/task_management
# REDIS_HOST=127.0.0.1
# REDIS_PORT=6379


```



### 5️⃣ Run the Application
```bash
npm run dev
```

Server will start on **http://localhost:5000**

---

## 🧩 Features

✅ **User Management**
- Register and login with JWT authentication  
- Manage profiles and team memberships  

✅ **Task Management**
- Create, edit, delete, and assign tasks  
- Add priority, tags, and due date  
- Track status: *Pending*, *In Progress*, *Completed*  

✅ **Team Collaboration**
- Create and manage teams  
- Invite members via email  

✅ **Email Notifications**
- Automatic reminders for upcoming tasks  
- Email invites and notifications via **BullMQ + Redis**  

✅ **Background Jobs**
- Uses **BullMQ** for delayed jobs and queue handling  
- Handles reminders and email tasks asynchronously  

✅ **Error Handling**
- Centralized error middleware for clean responses  

✅ **Scalable and Modular**
- Clean folder structure for easy maintenance  

---

## 🧠 Example API Endpoints

## 👤 User (Auth) APIs

| Method | Endpoint | Description |
|--------|-----------|-------------|
| **POST** | `/api/users/register` | Register a new user |
| **POST** | `/api/users/verify-otp` | Verify user OTP (protected) |
| **POST** | `/api/users/login` | Login user |
| **POST** | `/api/users/logout` | Logout user (protected) |

---

## ✅ Task APIs

| Method | Endpoint | Description |
|--------|-----------|-------------|
| **POST** | `/api/tasks/suggest-details` | Generate AI-based task details using Google Gemini |
| **POST** | `/api/tasks` | Create a new task |
| **GET** | `/api/tasks` | Get all tasks for logged-in user |
| **DELETE** | `/api/tasks/:taskId` | Delete a specific task |
| **PATCH** | `/api/tasks/:taskId/status` | Change status of a task (e.g., completed / pending) |
| **POST** | `/api/tasks/:taskId/comment` | Add a comment with optional file attachments (Multer) |
| **GET** | `/api/tasks/filter?status=<value>` | Filter tasks by status |
| **GET** | `/api/tasks/search?query=<keyword>` | Search tasks by title or description |

---

## 👥 Team APIs

| Method | Endpoint | Description |
|--------|-----------|-------------|
| **POST** | `/api/teams` | Create a new team |
| **POST** | `/api/teams/:teamId/invite` | Invite a member to a specific team |
| **POST** | `/api/teams/invites/:inviteId/accept` | Accept a team invitation |

---

## 📬 Email APIs

| Method | Endpoint | Description |
|--------|-----------|-------------|
| **POST** | `/api/mail/send` | Send a manual email notification |
| **POST** | `/api/tasks/:taskId/remind` | Schedule an automatic reminder email (BullMQ + Redis) |

---

## ⚙️ Middleware Usage

| Middleware | Purpose |
|-------------|----------|
| **protectRoute** | Ensures the route is accessed by authenticated users |
| **checkVerified** | Checks if user’s email/OTP is verified |
| **multerUpload** | Handles file uploads for comments and attachments |

---

## 📧 Example Email Reminder Flow

1. A task is created with a `reminderDateTime`.  
2. The task is added to a **BullMQ queue**.  
3. **BullMQ Worker** picks up the job at the scheduled time.  
4. A mail is sent using **Nodemailer / Brevo API** to notify the user.

---

## 🧰 Available Commands

| Command | Description |
|----------|-------------|
| `npm start` | Start the server in production mode |
| `npm run dev` | Start server in development mode (nodemon) |
| `redis-server` | Start Redis locally |
| `npm run lint` | Run ESLint checks (optional) |

---

## 📜 Example JSON (Create Task)

### Request:
```json
POST /api/tasks
{
  "title": "Finish report",
  "description": "Complete the project report by Friday",
  "dueDateTime": "2025-10-30T17:00:00Z",
  "reminderDateTime": "2025-10-29T10:00:00Z",
  "priority": "High",
  "tags": ["work", "report"],
  "status": "Pending"
}
```

### Response:
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "_id": "671a6f2b4a23dfb9d5efc789",
    "title": "Finish report",
    "status": "Pending"
  }
}
```

---

## 👨‍💻 Contribution Guide

1. **Fork** this repository  
2. **Create a branch** (`feature/your-feature-name`)  
3. **Commit** your changes  
4. **Push** to your fork  
5. Create a **Pull Request**

---

## 🧾 License
This project is licensed under the **MIT License** — free for personal and commercial use.

---

## 🌟 Acknowledgements
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Redis](https://redis.io/)
- [BullMQ](https://docs.bullmq.io/)
- [Brevo](https://www.brevo.com/)
