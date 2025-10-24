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
│   ├── config/
│   │   ├── db.js                # MongoDB connection
│   │   ├── redis.js             # Redis connection
│   │
│   ├── controllers/             # Controllers for handling requests
│   │   ├── taskController.js
│   │   ├── userController.js
│   │   ├── teamController.js
│   │   └── mailController.js
│   │
│   ├── models/                  # Database models (Mongoose)
│   │   ├── Task.js
│   │   ├── User.js
│   │   ├── Team.js
│   │
│   ├── jobs/                    # BullMQ job processors
│   │   ├── reminderJob.js
│   │   └── emailJob.js
│   │
│   ├── queues/                  # BullMQ queue setup
│   │   ├── reminderQueue.js
│   │   └── emailQueue.js
│   │
│   ├── routes/                  # Express route definitions
│   │   ├── taskRoutes.js
│   │   ├── userRoutes.js
│   │   ├── teamRoutes.js
│   │   └── index.js
│   │
│   ├── utils/                   # Helper functions
│   │   ├── sendMail.js
│   │   └── helpers.js
│   │
│   ├── app.js                   # Express app configuration
│   └── server.js                # Entry point
│
├── .env                         # Environment variables
├── .gitignore
├── package.json
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
PORT=5000
MONGO_URI=mongodb://localhost:27017/task_management
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Email (Brevo / Nodemailer)
BREVO_API_KEY=your_brevo_api_key

# JWT Secret (for authentication)
JWT_SECRET=your_secret_key
```

### 4️⃣ Start Redis Server
Make sure Redis is running locally:
```bash
redis-server
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

| Method | Endpoint | Description |
|--------|-----------|-------------|
| **POST** | `/api/users/register` | Register a new user |
| **POST** | `/api/users/login` | Login user |
| **GET** | `/api/tasks` | Fetch all tasks |
| **POST** | `/api/tasks` | Create new task |
| **PUT** | `/api/tasks/:id` | Update task |
| **DELETE** | `/api/tasks/:id` | Delete task |
| **POST** | `/api/tasks/:id/remind` | Schedule a reminder |
| **POST** | `/api/teams/invite` | Invite user to team |
| **POST** | `/api/mail/send` | Send manual email |

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
