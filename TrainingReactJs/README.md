# Live Lab Corporate Training Platform

A scalable, production-ready React.js application for managing corporate live lab training sessions with role-based access control.

## Features

- **Multi-role Support**: Trainer, Trainee, Client, and Admin roles
- **Scheduling System**: Priority-based conflict resolution
- **Notification System**: Real-time notifications for all user types
- **Training Management**: Complete lifecycle management of training sessions

## Tech Stack

- React 18 with Hooks
- React Router v6
- Redux Toolkit for state management
- Material UI for components
- Vite for build tooling

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## User Roles

### Trainer
- Manage availability
- Accept/reject training requests
- Conduct and mark training sessions

### Trainee
- View assigned sessions
- Track training status
- View training history

### Client
- Request training sessions
- Assign up to 50 trainees per session
- View training history and invoices

### Admin
- Manage all users
- Resolve scheduling conflicts
- Configure priority scores
- System-wide oversight

## Business Rules

1. **Priority-Based Scheduling**: Conflicts resolved by client priority score
2. **High-Value Client Override**: Higher priority clients can override existing bookings
3. **Trainee Assignment**: Automatic updates on rescheduling/cancellation
4. **Notification System**: Comprehensive notifications for all events

