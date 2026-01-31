# MERN Chat Application

### Day-1 (January 30, 2026): Backend Development
- **Project Setup**: Initialized Node.js backend with Express server, configured for CORS and JSON parsing.
- **Database Models**:
  - `User`: Basic user schema with name, email, password (hashed with bcrypt).
  - `Group`: Group schema with name, creator reference, and group flag.
  - `GroupMember`: Junction table for group memberships with roles (admin/member).
  - `Message`: Message schema linked to groups and senders.
- **Authentication & User Management**:
  - Signup endpoint with email/name uniqueness checks and password hashing.
  - Login endpoint with JWT token generation.
  - User search by name (case-insensitive partial match).
- **Group Management**:
  - Create group endpoint (adds creator as admin).
  - List groups for a user.
- **Database Connection**: MongoDB setup with Mongoose.
- **Dependencies**: Installed Express, Mongoose, Socket.IO, bcrypt, JWT, CORS, dotenv, etc.

### Today (January 31, 2026): Frontend Development
- **Project Setup**: Initialized React app with Vite, configured for routing and development.
- **Authentication Pages**:
  - `Login`: Form to authenticate users, store JWT token, redirect to chat.
  - `Signup`: User registration form (assumed similar to login).
- **Chat Interface**:
  - Main chat page with sidebar (user info, create group button, group list).
  - Chat area with message display (placeholder), input field, and send button (UI only, socket integration pending).
  - Modals for creating groups and adding members.
- **User Search Component**: Debounced search for users by name, with results display.
- **Socket Client**: Basic Socket.IO client setup (not yet integrated into chat).
- **Styling**: CSS files for chat and user search components.
- **Dependencies**: Installed React, React Router, Axios, JWT-decode, Socket.IO-client, Vite plugins, ESLint.

### Notes
- Backend is fully functional for auth, groups, and real-time messaging.
- Frontend has UI for chat but messaging logic (via sockets) is not yet connected.
- No message persistence or member addition logic implemented yet.
- Errors in terminal suggest potential issues (e.g., missing env vars, incomplete message controller).


