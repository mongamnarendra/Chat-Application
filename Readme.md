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

### Day-2 (January 31, 2026): Frontend Development
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


### Day-3 (February 1, 2026): Group Chat & Members Implementation

- **Group Chat Implementation**
  - **Group Listing & Selection**
    - Displayed all groups of the logged-in user in a sidebar
    - Active group is highlighted when selected
    - Switching groups dynamically updates the chat space
    - Previous group messages are cleared when switching
  - **Group Chat Space (Dedicated Component)**
    - Chat UI moved into a separate component (ChatSpace.jsx)
    - Clear separation between:
      - Group list & layout (Chat.jsx)
      - Message handling & sockets (ChatSpace.jsx)
    - Improves maintainability and prevents socket duplication issues

- **Real-Time Group Messaging**
  - **Socket.IO Room-Based Messaging**
    - Each group uses its own Socket.IO room (groupId)
    - When a user selects a group:
      - Socket joins that group room
    - When the user switches groups:
      - Socket leaves the previous room
    - Messages are broadcast only to members of that group
  - **Message Persistence (Database)**
    - Every message is stored in MongoDB before being emitted
    - Stored fields:
      - groupId
      - senderId
      - senderName
      - message
      - createdAt
    - On group selection:
      - Previous messages are fetched from DB via REST API
      - Chat history is restored instantly

- **Chat UI (WhatsApp-Style)**
  - **Message Presentation**
    - Messages displayed as rounded chat bubbles
    - Layout rules:
      - Sender's messages → right side
      - Other users' messages → left side
    - Sender name shown above each message
    - Message timestamp shown below each message
    - Clean dark-themed chat layout
  - **Auto Scroll Behavior**
    - Chat automatically scrolls to the latest message
    - Implemented using useRef
    - No extra blank space or UI jump issues
    - Works consistently on:
      - New incoming messages
      - Switching groups

- **Add Members to Group**
  - **User Search & Add Member Flow**
    - Added "Add Members" button in chat header
    - Clicking opens a modal with user search
    - Admin selects a user from search results
    - REST API call adds the selected user to the group
    - Clean modal-based UX

- **Socket & State Handling Improvements**
  - **Stability & Cleanup**
    - Proper socket listener cleanup on:
      - Group change
      - Component unmount
    - Prevented:
      - Duplicate socket events
      - Message leakage between groups
    - Ensured messages render only for the active group

- **Outcome of Today's Work**
  - Fully functional real-time group chat
  - Persistent message history
  - WhatsApp-like UI & UX
  - Scalable component structure
  - Clean socket lifecycle management

### Notes
- Backend is fully functional for auth, groups, and real-time messaging.
- Frontend has UI for chat but messaging logic (via sockets) is not yet connected.
- No message persistence or member addition logic implemented yet.
- Errors in terminal suggest potential issues (e.g., missing env vars, incomplete message controller).



