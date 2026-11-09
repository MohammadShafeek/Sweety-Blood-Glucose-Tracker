# Sweety – Blood Glucose Tracker

Sweety is a web-based blood glucose tracking application that helps users record, manage, and monitor their glucose readings through a simple and user-friendly dashboard.

## Features

- User Registration and Login
- Secure Authentication using JWT
- Password Hashing using bcrypt
- Add, View, Edit, and Delete Glucose Readings
- Daily Glucose Reports
- Monthly Glucose Reports
- Previous Month Reports
- User-specific Reading Management
- Responsive User Interface

## Screenshots

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Login
![Login](screenshots/login.png)

### Register
![Register](screenshots/register.png)

### Reports
![Reports](screenshots/reports.png)

## Tech Stack

**Frontend**
- React.js
- JavaScript
- HTML5
- CSS3
- Vite

**Backend**
- Node.js
- Express.js
- REST APIs
- JWT Authentication
- bcrypt

**Database**
- PostgreSQL

**Tools**
- Git and GitHub
- Postman
- VS Code

## Project Structure

```text
Sweety/
├── client/
│   └── React Frontend
├── server/
│   └── Express Backend
├── screenshots/
├── .gitignore
└── README.md
```

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/MohammadShafeek/Sweety-Blood-Glucose-Tracker.git
cd Sweety-Blood-Glucose-Tracker
```

### 2. Setup Backend

```bash
cd server
npm install
```

Create a `.env` file using `.env.example` and configure your PostgreSQL database credentials and JWT secret.

### 3. Setup Database

- Create a PostgreSQL database named `sweety_db`.
- Execute the SQL schema provided in the server configuration.

### 4. Start Backend

Run the backend using the start script configured in `server/package.json`.

### 5. Setup Frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Open the local URL displayed by Vite in your browser.

## Security

- Passwords are hashed using bcrypt.
- Protected API routes use JWT authentication.
- Environment variables are excluded from version control.

## Author

**Mohammad Shafeek**

- GitHub: [MohammadShafeek](https://github.com/MohammadShafeek)
- LinkedIn: [Mohammad Shafeek](https://www.linkedin.com/in/mohammad-shafeek-b74124339/)
