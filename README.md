# PRODUCT MANAGEMENT DASHBOARD
A full-stack real-time collaborative project management platform built with React, Node.js, and Socket.IO. Track tasks, manage team members, and collaborate in real-time with role-based permissions.

## Feature
### Identity And Access Management
  - Granular permission system based on user roles:
    - **Admin:** Full system access (add/remove members, delete projects, manage all tasks)
    - **Manager:** Can create/edit tasks, manage team workflows, but cannot delete projects
    - **Member:** Can view all tasks, create/edit assigned tasks, cannot modify team composition

### Project Management
  - View and edit project details
  - Close or leave projects

### Collaboration
  - Candidates can be added to the Project by Admin With specified Roles
  - They can Communicate and get Live Feed Regarding the project
  - Also They can View Active Members

### Task Management
  - Create, update, and delete tasks
  - Assign tasks to users
  - Set due dates and priorities (Low, Medium, High)
  - Filter tasks using search input
  - Real-time updates via WebSocket

### Real-Time Collaboration
  - WebSocket-based updates for:
      - New tasks
      - Task Updates
      - Comments
      - Member Changes
  - Presence detection using Socket.IO rooms

### UI Components
  - Drawer-style task detail view with comment section
  - MUI components for avatars, tooltips, and more

## File Structure

```
project/
│
├── client/                  # React Frontend
│   ├── public/
│   └── src/
│       ├── components/      # Reusable UI components
│       ├── config/          # For Secert Data and Sever Credentials
│       ├── interface/       
│       ├── redux/           # Redux store and actions
│       ├── services/        # API services (Axios)
│       ├── utils/           # Helper functions
│       └── App.jsx
│
├── server/                  # Node.js Express Backend
│   ├── config/              # Config files
│   ├── controller/          # Business logic
│   ├── database/            # DB models and queries
│   ├── handler/             # Route handlers
│   ├── middleware/          # Auth, logging
│   ├── router/              # API route definitions
│   ├── services/            # External integrations (e.g., Socket.IO)
│   └── app.js               # Server entry point
│
├── .env.example             # Example environment variables
└── package.json
```

## How to run the File
### Prerequisites
 - Node.js
 - npm or yarn
 - SQL-compatible database

### Installation
 1. Clone the repository
    ```bash
        git clone githubUri.git
        cd product-management-dashboard
    ```
  2. Install Dependencies
      ```bash
        cd server
        npm install
      ```
      ```bash
        cd client
        npm install
      ```
  3. Configure environment variables
    - Copy the ```.env.example``` and create a ```.env``` file in server folder.
    - Fill all the fields in the .env based on .env.example
  4. Running the application
- Start the backend server
```bash
   cd server
   npm start
 ```
- Start the frontend application 
```bash
cd client
npm start
```
- Access the application
Open your browser and navigate to: http://localhost:3000

## FLOW
- Open the WebApp
- Login Screen will appear
- Signup/Login
- Once Logged in you will be redirected to the dashboard
- There you will be able to view all the projects which are yours or were assigned to you
- Create Your own project through ```Create Project``` Button
- After Filling the details
- You can open the project their you can Add other members.
- Collaborate with these members
- Discuss
- Complete Task
