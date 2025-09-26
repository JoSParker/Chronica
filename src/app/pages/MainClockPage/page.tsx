'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './MainClockPage.module.css';

interface Task {
  id: string;
  name: string;
  description?: string;
  status: 'in_progress' | 'paused' | 'completed';
  total_time: number;
  created_at: string;
}

interface TimeEntry {
  id: string;
  task_id: string;
  task_name: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
}

interface TaskCardProps {
  task: Task;
  isActive: boolean;
  elapsedTime: number;
  onStart: (taskId: string) => void;
  onStop: () => void;
  onSelect: (taskId: string) => void;
}

// Individual Task Card Component
const TaskCard = ({ task, isActive, elapsedTime, onStart, onStop, onSelect }: TaskCardProps) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalTime = () => {
    const totalSeconds = (task.total_time || 0) + (isActive ? elapsedTime : 0);
    return formatTime(totalSeconds);
  };

  return (
    <div 
      className={`${styles.taskCard} ${isActive ? styles.activeCard : ''}`}
      onClick={() => !isActive && onSelect(task.id)}
    >
      <div className={styles.cardHeader}>
        <div className={styles.taskInfo}>
          <h3 className={styles.taskName}>{task.name}</h3>
          <p className={styles.taskDescription}>{task.description}</p>
          <div className={styles.taskStatus}>
            <span className={`${styles.statusBadge} ${styles[task.status]}`}>
              {task.status.replace('_', ' ')}
            </span>
          </div>
        </div>
        <div className={styles.timerSection}>
          <div className={styles.totalTime}>
            Total: {getTotalTime()}
          </div>
          {isActive && (
            <div className={styles.currentTimer}>
              Session: {formatTime(elapsedTime)}
            </div>
          )}
        </div>
      </div>
      
      <div className={styles.cardActions}>
        {isActive ? (
          <button 
            className={`${styles.actionButton} ${styles.stopButton}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Stop button clicked');
              onStop();
            }}
            type="button"
          >
            ⏹ STOP TIMER
          </button>
        ) : (
          <div className={styles.actionHint}>
            Click to start timing this task
          </div>
        )}
      </div>
    </div>
  );
};

export default function MainClockPage() {
  // State management for tasks and timer
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const [fullscreenMode, setFullscreenMode] = useState<boolean>(false);
  const [showCreateTask, setShowCreateTask] = useState<boolean>(false);
  const [newTaskName, setNewTaskName] = useState<string>('');
  const [newTaskDescription, setNewTaskDescription] = useState<string>('');
  
  // Timer reference for cleanup
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load tasks from localStorage on component mount
  useEffect(() => {
    loadTasks();
  }, []);

  // Timer effect - runs every second when a task is active
  useEffect(() => {
    if (activeTaskId && startTime) {
      // Start the timer - updates every second
      timerRef.current = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    } else {
      // Clear timer when no active task
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    // Keyboard shortcuts
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (fullscreenMode) {
          setFullscreenMode(false);
        } else if (activeTaskId) {
          handleStopTask();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [activeTaskId, startTime, fullscreenMode]);

  // Load tasks from localStorage
  const loadTasks = () => {
    try {
      const savedTasks = localStorage.getItem('timeTrackerTasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      } else {
        // Start with empty task list
        setTasks([]);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      setError('Failed to load tasks from storage');
    } finally {
      setLoading(false);
    }
  };

  // Save tasks to localStorage
  const saveTasks = (tasksToSave: Task[]) => {
    try {
      localStorage.setItem('timeTrackerTasks', JSON.stringify(tasksToSave));
    } catch (error) {
      console.error('Error saving tasks:', error);
      setError('Failed to save tasks to storage');
    }
  };

  // Save time entries to localStorage
  const saveTimeEntry = (timeEntry: TimeEntry) => {
    try {
      const savedEntries = localStorage.getItem('timeTrackerEntries');
      const entries: TimeEntry[] = savedEntries ? JSON.parse(savedEntries) : [];
      entries.push(timeEntry);
      localStorage.setItem('timeTrackerEntries', JSON.stringify(entries));
      console.log('Time entry saved:', timeEntry);
    } catch (error) {
      console.error('Error saving time entry:', error);
      setError('Failed to save time entry');
    }
  };

  // Handle task selection - show confirmation dialog
  const handleTaskSelect = (taskId: string) => {
    const selectedTask = tasks.find(task => task.id === taskId);
    if (selectedTask) {
      setPendingTaskId(taskId);
      setShowConfirmDialog(true);
    }
  };

  // Handle starting a task after confirmation
  const handleStartTask = async (taskId: string) => {
    // Stop any currently running task before starting a new one
    if (activeTaskId) {
      await handleStopTask();
    }

    // STATE UPDATE: Set the active task and start time
    const now = new Date();
    setActiveTaskId(taskId);
    setStartTime(now);
    setElapsedTime(0);
    setError('');

    const taskName = tasks.find(t => t.id === taskId)?.name || 'Unknown Task';
    console.log(`Started task: ${taskName} at ${now.toISOString()}`);
    setShowConfirmDialog(false);
    setPendingTaskId(null);
    setFullscreenMode(true);
  };

  // Handle confirmation dialog
  const handleConfirmStart = () => {
    if (pendingTaskId) {
      handleStartTask(pendingTaskId);
    }
  };

  const handleCancelStart = () => {
    setShowConfirmDialog(false);
    setPendingTaskId(null);
  };

  // Save time entry and stop the current task
  const handleStopTask = async () => {
    console.log('handleStopTask called', { activeTaskId, startTime });
    if (!activeTaskId || !startTime) return;

    const endTime = new Date();
    const durationMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));
    
    // Find the task name for the active task
    const activeTask = tasks.find(task => task.id === activeTaskId);
    const taskName = activeTask?.name || 'Unknown Task';

    const timeEntry: TimeEntry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      task_id: activeTaskId,
      task_name: taskName,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration_minutes: Math.max(durationMinutes, 1) // Minimum 1 minute
    };

    try {
      // Save time entry to localStorage
      saveTimeEntry(timeEntry);
      
      // Update task's total time
      const updatedTasks = tasks.map(task => {
        if (task.id === activeTaskId) {
          return {
            ...task,
            total_time: task.total_time + elapsedTime,
            status: 'paused' as const
          };
        }
        return task;
      });
      
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
      
      // STATE UPDATE: Clear active task state
      setActiveTaskId(null);
      setStartTime(null);
      setElapsedTime(0);
      setFullscreenMode(false);
      
      console.log(`Stopped task: ${taskName}, Duration: ${durationMinutes} minutes`);
    } catch (err) {
      console.error('Failed to save time entry:', err);
      setError('Failed to save time entry');
    }
  };

  const handleLogout = () => {
    // Clear localStorage and refresh
    localStorage.clear();
    window.location.reload();
  };

  const createNewTask = () => {
    if (!newTaskName.trim()) {
      setError('Task name is required');
      return;
    }

    const newTask: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newTaskName.trim(),
      description: newTaskDescription.trim() || undefined,
      status: 'in_progress' as const,
      created_at: new Date().toISOString(),
      total_time: 0
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    
    // Reset form
    setNewTaskName('');
    setNewTaskDescription('');
    setShowCreateTask(false);
    setError('');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading your tasks...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Chronica</h1>
          <div className={styles.userInfo}>
            <span className={styles.userEmail}>demo@timetracker.com</span>
            <button 
              className={styles.logoutButton}
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <div className={styles.createTaskSection}>
          <button 
            className={styles.createTaskButton}
            onClick={() => setShowCreateTask(true)}
          >
            + Create New Task
          </button>
        </div>

        <div className={styles.tasksGrid}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isActive={activeTaskId === task.id}
              elapsedTime={activeTaskId === task.id ? elapsedTime : 0}
              onStart={handleStartTask}
              onStop={handleStopTask}
              onSelect={handleTaskSelect}
            />
          ))}
        </div>

        {tasks.length === 0 && !loading && (
          <div className={styles.emptyState}>
            <h3>Ready to start tracking?</h3>
            <p>Create your first task above to begin timing your work.</p>
          </div>
        )}
      </main>

      {/* Confirmation Dialog */}
      {showConfirmDialog && pendingTaskId && (
        <div className={styles.dialogOverlay}>
          <div className={styles.confirmDialog}>
            <h3 className={styles.dialogTitle}>Start Timer?</h3>
            <p className={styles.dialogMessage}>
              Do you want to start timing "{tasks.find(t => t.id === pendingTaskId)?.name}"?
              {activeTaskId && (
                <span className={styles.warningText}>
                  <br />This will stop the current timer.
                </span>
              )}
            </p>
            <div className={styles.dialogActions}>
              <button 
                className={`${styles.dialogButton} ${styles.cancelButton}`}
                onClick={handleCancelStart}
              >
                Cancel
              </button>
              <button 
                className={`${styles.dialogButton} ${styles.confirmButton}`}
                onClick={handleConfirmStart}
              >
                Start Timer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Dialog */}
      {showCreateTask && (
        <div className={styles.dialogOverlay}>
          <div className={styles.confirmDialog}>
            <h3 className={styles.dialogTitle}>Create New Task</h3>
            <div className={styles.createTaskForm}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Task Name *</label>
                <input
                  type="text"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  className={styles.taskInput}
                  placeholder="Enter task name"
                  maxLength={100}
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Description (Optional)</label>
                <textarea
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  className={styles.taskTextarea}
                  placeholder="Enter task description"
                  rows={3}
                  maxLength={500}
                />
              </div>
            </div>
            <div className={styles.dialogActions}>
              <button 
                className={`${styles.dialogButton} ${styles.cancelButton}`}
                onClick={() => {
                  setShowCreateTask(false);
                  setNewTaskName('');
                  setNewTaskDescription('');
                  setError('');
                }}
              >
                Cancel
              </button>
              <button 
                className={`${styles.dialogButton} ${styles.confirmButton}`}
                onClick={createNewTask}
                disabled={!newTaskName.trim()}
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Timer Mode */}
      {fullscreenMode && activeTaskId && (
        <div className={styles.fullscreenTimer}>
          <div className={styles.fullscreenContent}>
            <button 
              className={styles.exitFullscreen}
              onClick={() => setFullscreenMode(false)}
            >
              ✕
            </button>
            
            <div className={styles.fullscreenTaskName}>
              {tasks.find(t => t.id === activeTaskId)?.name}
            </div>
            
            <div className={styles.fullscreenTime}>
              {(() => {
                const hours = Math.floor(elapsedTime / 3600);
                const minutes = Math.floor((elapsedTime % 3600) / 60);
                const secs = elapsedTime % 60;
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
              })()}
            </div>
            
            <div className={styles.fullscreenDescription}>
              {tasks.find(t => t.id === activeTaskId)?.description}
            </div>
            
            <button 
              className={styles.fullscreenStopButton}
              onClick={handleStopTask}
            >
              ⏹ STOP TIMER
            </button>
            
            <div className={styles.fullscreenHint}>
              Press ESC to minimize • ESC twice to stop
            </div>
          </div>
        </div>
      )}
    </div>
  );
}