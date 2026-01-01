# Quick Start Guide

## Installation

1. Install dependencies:
```bash
npm install
```

## Running the Application

Start the development server:
```bash
npm run dev
```

The application will open at `http://localhost:3000`

## Login Credentials

The application includes demo accounts for each role. Use the following credentials:

### Trainer
- Email: trainer@example.com
- Password: password

### Trainee
- Email: trainee@example.com
- Password: password

### Client
- Email: client@example.com
- Password: password

### Admin
- Email: admin@example.com
- Password: password

## Features Overview

### Trainer Dashboard
- Manage availability slots
- Accept/reject training requests
- View and manage training sessions
- Mark trainings as completed or cancelled
- View training history

### Trainee Dashboard
- View assigned training sessions
- Track training status (upcoming, attended, completed, missed)
- Mark attendance for trainings
- View training history

### Client Dashboard
- Request training sessions for up to 50 trainees
- View training requests status (pending, approved, rejected, rescheduled)
- View training history and invoices
- See priority score and rating
- Track total cost (₹1000 per session)

### Admin Dashboard
- View all trainings and users
- Detect and resolve scheduling conflicts
- Manage client priority scores
- Monitor system-wide activities
- Override scheduling decisions

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components (DataTable, Modal, Alert)
│   ├── trainer/        # Trainer-specific components
│   ├── trainee/        # Trainee-specific components
│   └── client/         # Client-specific components
├── pages/              # Main page components
│   ├── Login.jsx
│   ├── TrainerDashboard.jsx
│   ├── TraineeDashboard.jsx
│   ├── ClientDashboard.jsx
│   └── AdminDashboard.jsx
├── store/              # Redux store and slices
│   ├── slices/        # Redux slices (auth, training, notifications, users)
│   └── store.js
├── services/           # API services
│   └── mockApi.js     # Mock API layer
├── utils/              # Utility functions
│   └── scheduling.js  # Scheduling and conflict resolution logic
└── hooks/              # Custom React hooks
    └── useNotifications.js
```

## Business Rules Implementation

### Priority-Based Scheduling
- Conflicts are resolved using client priority scores
- Higher priority clients automatically win conflicts
- Lower priority clients are notified and offered alternatives

### High-Value Client Override
- When a higher priority client requests a booked slot, the system:
  1. Allocates the slot to the higher priority client
  2. Notifies the displaced client
  3. Offers alternative time slots
  4. Notifies trainer and admin

### Notification System
- Real-time notifications for all role-based events
- Notification types: informational, warning, action required
- Unread notification count displayed in header

## Mock API

The application uses a mock API layer (`src/services/mockApi.js`) that simulates backend functionality. In production, replace these with actual API calls to your backend service.

## State Management

The application uses Redux Toolkit for state management with the following slices:
- `authSlice`: Authentication and user session
- `trainingSlice`: Training sessions, availability, and requests
- `notificationSlice`: Notifications for all users
- `userSlice`: User management (trainers, trainees, clients)

## Next Steps

1. Replace mock API with actual backend integration
2. Add form validation
3. Implement real-time updates (WebSocket)
4. Add data persistence
5. Enhance error handling
6. Add unit and integration tests

