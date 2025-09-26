# MainClockPage - Time Tracker Component

## Overview
MainClockPage is a comprehensive time tracking component built with Next.js, React, and Supabase. It allows users to track time spent on various tasks with real-time timers and automatic data persistence.

## Features

### ✅ Complete Functionality
- **User Authentication**: Integrates with Supabase Auth
- **Real-time Timers**: Updates every second while a task is active
- **Single Task Limitation**: Only one task can run at a time
- **Automatic Data Persistence**: Saves time entries to Supabase
- **Responsive Design**: Works on desktop and mobile
- **Modern UI**: Clean, minimal design with hover effects

### ✅ State Management
- Uses React hooks (`useState`, `useEffect`) for all state management
- Timer state with `useRef` for cleanup
- Real-time elapsed time tracking
- User authentication state

### ✅ Database Integration
- Fetches user's tasks from Supabase on page load
- Creates default tasks for new users
- Saves time entries with task name, start time, end time, and duration
- Row Level Security (RLS) enabled for user data isolation

## Setup Instructions

### 1. Database Setup
Run the SQL commands in `database_setup.sql` in your Supabase SQL editor to create the necessary tables:

```sql
-- Creates tables: tasks, time_entries
-- Enables Row Level Security
-- Sets up proper indexes and triggers
```

### 2. File Structure
```
src/app/pages/MainClockPage/
├── page.tsx                    # Main component
├── MainClockPage.module.css    # Styles
└── database_setup.sql          # Database schema
```

### 3. Navigation
- Login redirects to `/dashboard`
- Dashboard redirects to `/pages/MainClockPage`
- Direct access: `http://localhost:3000/pages/MainClockPage`

## Component Architecture

### State Management
```typescript
// User and authentication
const [user, setUser] = useState<User | null>(null);

// Tasks and UI state  
const [tasks, setTasks] = useState<Task[]>([]);
const [loading, setLoading] = useState<boolean>(true);
const [error, setError] = useState<string>('');

// Timer state
const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
const [elapsedTime, setElapsedTime] = useState<number>(0);
const [startTime, setStartTime] = useState<Date | null>(null);
const timerRef = useRef<NodeJS.Timeout | null>(null);
```

### Key Functions

#### Timer Management
- **`handleStartTask(taskId)`**: Starts a task timer, stops any active task first
- **`handleStopTask()`**: Stops current task and saves time entry to database
- **Timer Effect**: Updates elapsed time every second using `setInterval`

#### Supabase Integration
- **`checkUser()`**: Verifies authentication status
- **`fetchTasks()`**: Loads user's tasks from database
- **`createDefaultTasks()`**: Creates initial tasks for new users
- **Time Entry Saving**: Automatic when stopping tasks or navigating away

#### Data Persistence
- **Auto-save**: Time entries saved when user stops task or leaves page
- **Minimum Duration**: Ensures at least 1 minute is recorded
- **Complete Data**: Stores task ID, name, user ID, timestamps, and duration

## Database Schema

### Tasks Table
```sql
tasks (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Time Entries Table
```sql
time_entries (
  id UUID PRIMARY KEY,
  task_id UUID REFERENCES tasks(id),
  task_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  duration_minutes INTEGER,
  created_at TIMESTAMP
)
```

## CSS Design Features

### Modern Minimal Design
- **Clean Cards**: Rounded corners, subtle shadows
- **Hover Effects**: Smooth animations and elevation
- **Color Palette**: Neutral grays with blue/green accents
- **Typography**: Inter font family for modern look

### Responsive Layout
- **Desktop**: Grid layout with multiple columns
- **Mobile**: Single column stack
- **Adaptive**: Adjusts padding and spacing

### Interactive Elements
- **Active Task Highlighting**: Blue gradient background
- **Animated Timer**: Pulsing effect for running timers
- **Button States**: Hover, focus, and active states
- **Loading States**: Skeleton screens and spinners

## Usage Flow

1. **Authentication**: User must be logged in via Supabase Auth
2. **Task Loading**: Component fetches user's tasks on mount
3. **Default Tasks**: Creates Work, Study, Exercise, Reading if none exist
4. **Task Selection**: User clicks a task card or start button
5. **Timer Start**: Real-time timer begins, other tasks disabled
6. **Timer Stop**: User clicks stop, data saved to Supabase
7. **Data Persistence**: Automatic save on navigation or page close

## Error Handling

- **Authentication Errors**: Redirects to login page
- **Database Errors**: Shows user-friendly error messages
- **Network Issues**: Graceful degradation and retry logic
- **Timer Cleanup**: Prevents memory leaks with proper cleanup

## Performance Optimizations

- **Efficient Re-renders**: Proper dependency arrays in useEffect
- **Timer Cleanup**: Clears intervals on unmount
- **Database Indexes**: Optimized queries with proper indexing
- **Responsive Images**: Optimized loading and display

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support
- **Focus Indicators**: Clear focus outlines
- **Screen Reader Support**: Proper ARIA labels
- **Reduced Motion**: Respects user preferences
- **Color Contrast**: WCAG compliant color ratios

This component provides a complete, production-ready time tracking solution with modern UI/UX and robust data management.