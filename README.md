# SlotSwapper

A full-stack web application that allows users to create calendar events and swap time slots with other users. Built with React + TypeScript frontend and Express.js + MongoDB backend.

## 🎯 Project Overview

SlotSwapper is designed to help users manage their schedules collaboratively by allowing them to:
- Create and manage calendar events
- Mark time slots as available for swapping
- Browse available slots from other users
- Send and receive swap requests
- Accept or reject swap proposals

### Key Design Choices

1. **Unified API Architecture**: Originally implemented separate endpoints for incoming/outgoing swap requests, but refactored to use a single endpoint with frontend filtering for better performance and maintainability.

2. **JWT Authentication**: Implemented stateless authentication using JSON Web Tokens for secure user sessions.

3. **MongoDB with Mongoose**: Used MongoDB for flexible document storage with Mongoose for schema validation and relationships.

4. **Component-Based Frontend**: Built with reusable React components using Shadcn UI for consistent design.

5. **Protected Routes**: Implemented route protection to ensure authenticated access to core features.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd assignmentServiceHive
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Configuration**
   
   Create a `.env` file in the backend directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/slotswapper
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=3000
   ```

5. **Database Setup**
   
   Ensure MongoDB is running locally or update the `MONGODB_URI` in `.env` to point to your MongoDB Atlas cluster.

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run build
   npm start
   
   # Or for development with auto-reload:
   npm run dev
   ```

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## 🔧 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/api/user/signup` | Register new user | `{ name, email, password }` |
| POST | `/api/user/signin` | Login user | `{ email, password }` |

### Event Management

| Method | Endpoint | Description | Headers | Body |
|--------|----------|-------------|---------|------|
| GET | `/api/events` | Get user's events | `Authorization: Bearer <token>` | - |
| POST | `/api/events` | Create new event | `Authorization: Bearer <token>` | `{ title, date, startTime, endTime, description }` |
| PUT | `/api/events/:id` | Update event status | `Authorization: Bearer <token>` | `{ status }` |

### Swappable Slots

| Method | Endpoint | Description | Headers |
|--------|----------|-------------|---------|
| GET | `/api/swappable-slots` | Get all available slots for swapping | `Authorization: Bearer <token>` |

### Swap Requests

| Method | Endpoint | Description | Headers | Body |
|--------|----------|-------------|---------|------|
| GET | `/api/swap-requests` | Get all swap requests (incoming & outgoing) | `Authorization: Bearer <token>` | - |
| POST | `/api/swap-request` | Create a swap request | `Authorization: Bearer <token>` | `{ mySlotId, theirSlotId }` |
| POST | `/api/swap-response/:requestId` | Respond to swap request | `Authorization: Bearer <token>` | `{ accepted: boolean }` |

### API Response Format

All API responses follow this structure:
```json
{
  "success": true/false,
  "message": "Response message",
  "data": { ... } // or "requests", "events", etc.
}
```

### Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 🏗️ Project Structure

```
assignmentServiceHive/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── dbConnect.ts
│   │   ├── controllers/
│   │   │   ├── eventControllers.ts
│   │   │   ├── swapRequestControllers.ts
│   │   │   └── userControllers.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   ├── models/
│   │   │   ├── eventModel.ts
│   │   │   ├── swapRequestModel.ts
│   │   │   └── userModel.ts
│   │   ├── routes/
│   │   │   ├── eventRoutes.ts
│   │   │   ├── swapRequestRoutes.ts
│   │   │   ├── swappableSlotsRoutes.ts
│   │   │   └── userRoutes.ts
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/ (Shadcn components)
│   │   │   ├── Navigation.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Homepage.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Marketplace.tsx
│   │   │   ├── Requests.tsx
│   │   │   └── Signup.tsx
│   │   ├── lib/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## 🧭 Features

### ✅ Implemented Features

- **User Authentication**: Sign up, sign in, JWT-based sessions
- **Event Management**: Create, view, and update calendar events
- **Event Status Management**: Mark events as BUSY, FREE, or SWAPPABLE
- **Marketplace**: Browse available slots from other users
- **Swap Requests**: Send, receive, accept, and reject swap proposals
- **Dashboard**: Personal calendar view with event management
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS
- **Protected Routes**: Secure access to authenticated features
- **Real-time Notifications**: WebSocket-powered instant notifications for swap requests and responses
- **Browser Notifications**: Desktop notification support for real-time updates

### 🔄 Technical Highlights

- **Database Relationships**: Proper MongoDB relationships between Users, Events, and SwapRequests
- **Transaction Safety**: MongoDB transactions for atomic swap operations
- **Input Validation**: Comprehensive validation on both frontend and backend
- **Error Handling**: Robust error handling with user-friendly messages
- **Type Safety**: Full TypeScript implementation across the stack
- **Real-time Communication**: Socket.IO integration for instant notifications
- **WebSocket Authentication**: Secure WebSocket connections with JWT token validation
- **Auto-refresh**: Automatic data refresh when receiving real-time notifications

## 🧪 Testing the Application

### User Flow Testing

1. **Registration/Login**
   - Visit http://localhost:5173
   - Sign up with new credentials
   - Login with your credentials

2. **Create Events**
   - Navigate to Dashboard
   - Create a new event
   - Mark it as "SWAPPABLE"

3. **Browse Marketplace**
   - Go to Marketplace to see other users' available slots
   - Send a swap request for a desired slot

4. **WebSocket Connection Testing**
   
   When logged in, you'll see a notification bell icon in the navigation bar with connection status indicator:
   - Green dot: Connected to real-time notifications
   - Red/no dot: Disconnected from real-time notifications

5. **Real-time Notification Testing**
   
   Test the real-time features:
   - Login with two different user accounts in separate browser windows
   - Create swappable events for both users
   - Send a swap request from one user to another
   - The recipient should instantly receive a notification without page refresh
   - Accept/reject the request to see response notifications in real-time

### Sample Test Data

You can create test users and events to test the swap functionality:

```json
// User 1
{
  "name": "Alice Smith",
  "email": "alice@example.com",
  "password": "password123"
}

// User 2
{
  "name": "Bob Johnson",
  "email": "bob@example.com",
  "password": "password123"
}
```

## 🎯 Assumptions Made

1. **Time Format**: Used 24-hour time format for consistency
2. **Date Handling**: Dates are stored as strings in YYYY-MM-DD format
3. **Slot Duration**: No minimum or maximum duration restrictions
4. **User Validation**: Basic email format validation, no email verification
5. **Concurrent Requests**: Users can have multiple pending swap requests
6. **Swap Logic**: When a swap is accepted, both events exchange ownership completely

## 🚧 Challenges Faced

### 1. **Swap Request Data Structure**
- **Challenge**: Initially designed separate endpoints for incoming/outgoing requests
- **Solution**: Refactored to single endpoint with frontend filtering for better performance

### 2. **MongoDB Relationships**
- **Challenge**: Ensuring proper population of nested user data in swap requests
- **Solution**: Used Mongoose populate with nested path specifications

### 3. **Frontend State Management**
- **Challenge**: Managing authentication state across components
- **Solution**: Used localStorage for token persistence and protected route patterns

### 4. **CORS Configuration**
- **Challenge**: Frontend-backend communication issues
- **Solution**: Configured comprehensive CORS settings for development

### 5. **Real-time WebSocket Integration**
- **Challenge**: Implementing instant notifications without page refresh
- **Solution**: Integrated Socket.IO for bidirectional real-time communication with JWT authentication

### 6. **Browser Notification Permissions**
- **Challenge**: Managing browser notification permissions and fallbacks
- **Solution**: Graceful permission request with fallback to in-app notifications only

## 🔮 Future Enhancements

- **Enhanced Real-time Features**: Real-time calendar updates and collaborative editing
- **Email Notifications**: Send email alerts for swap requests and responses
- **Calendar Integration**: Import/export functionality with popular calendar apps
- **Advanced Filtering**: Filter marketplace by date, time, location, etc.
- **Recurring Events**: Support for repeating events and bulk swap operations
- **User Profiles**: Enhanced user profiles with availability preferences
- **Mobile App**: React Native mobile application
- **Push Notifications**: Mobile push notifications for real-time updates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add appropriate tests
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

---

**Note**: This is a demonstration project built for educational purposes. For production use, additional security measures, testing, and optimization would be recommended.