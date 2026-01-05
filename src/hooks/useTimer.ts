import { useState, useEffect, useCallback, useRef } from 'react';

export interface TimerState {
  isRunning: boolean;
  startTime: Date | null;
  elapsedSeconds: number;
  projectLabel: string;
}

const STORAGE_KEY = 'timesum_active_timer';
const ORIGINAL_TITLE = document.title;

interface StoredTimer {
  startTime: string;
  projectLabel: string;
}

/**
 * Format seconds to HH:MM:SS display string
 */
export function formatTimerDisplay(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Convert seconds to decimal hours
 */
export function secondsToDecimalHours(seconds: number): number {
  return seconds / 3600;
}

/**
 * Custom hook for managing a work timer with persistence and tab title updates
 */
export function useTimer() {
  const [state, setState] = useState<TimerState>({
    isRunning: false,
    startTime: null,
    elapsedSeconds: 0,
    projectLabel: '',
  });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  // Calculate elapsed seconds from start time
  const calculateElapsed = useCallback((startTime: Date): number => {
    return Math.floor((Date.now() - startTime.getTime()) / 1000);
  }, []);

  // Update tab title with timer
  const updateTabTitle = useCallback((elapsed: number, isRunning: boolean, projectLabel?: string) => {
    if (isRunning) {
      const timeStr = formatTimerDisplay(elapsed);
      const projectStr = projectLabel ? ` - ${projectLabel}` : '';
      document.title = `⏱️ ${timeStr}${projectStr} | Timesum`;
    } else {
      document.title = ORIGINAL_TITLE;
    }
  }, []);

  // Restore timer from localStorage on mount
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { startTime, projectLabel }: StoredTimer = JSON.parse(stored);
        const parsedStartTime = new Date(startTime);
        
        if (!isNaN(parsedStartTime.getTime())) {
          const elapsed = calculateElapsed(parsedStartTime);
          setState({
            isRunning: true,
            startTime: parsedStartTime,
            elapsedSeconds: elapsed,
            projectLabel: projectLabel || '',
          });
        }
      }
    } catch (error) {
      console.error('Failed to restore timer:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [calculateElapsed]);

  // Timer tick effect
  useEffect(() => {
    if (state.isRunning && state.startTime) {
      // Update immediately
      const elapsed = calculateElapsed(state.startTime);
      setState(prev => ({ ...prev, elapsedSeconds: elapsed }));
      updateTabTitle(elapsed, true, state.projectLabel);

      // Set up interval for updates
      intervalRef.current = setInterval(() => {
        if (state.startTime) {
          const newElapsed = calculateElapsed(state.startTime);
          setState(prev => ({ ...prev, elapsedSeconds: newElapsed }));
          updateTabTitle(newElapsed, true, state.projectLabel);
        }
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    } else {
      updateTabTitle(0, false);
    }
  }, [state.isRunning, state.startTime, state.projectLabel, calculateElapsed, updateTabTitle]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      document.title = ORIGINAL_TITLE;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  /**
   * Start the timer with an optional project label
   */
  const start = useCallback((projectLabel: string = '') => {
    const startTime = new Date();
    
    // Persist to localStorage
    const stored: StoredTimer = {
      startTime: startTime.toISOString(),
      projectLabel,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    
    setState({
      isRunning: true,
      startTime,
      elapsedSeconds: 0,
      projectLabel,
    });
  }, []);

  /**
   * Stop the timer and return the elapsed time data
   */
  const stop = useCallback((): { elapsedSeconds: number; decimalHours: number; projectLabel: string } | null => {
    if (!state.isRunning || !state.startTime) {
      return null;
    }

    const finalElapsed = calculateElapsed(state.startTime);
    const decimalHours = secondsToDecimalHours(finalElapsed);
    const projectLabel = state.projectLabel;

    // Clear persistence
    localStorage.removeItem(STORAGE_KEY);
    
    // Reset state
    setState({
      isRunning: false,
      startTime: null,
      elapsedSeconds: 0,
      projectLabel: '',
    });

    return {
      elapsedSeconds: finalElapsed,
      decimalHours,
      projectLabel,
    };
  }, [state, calculateElapsed]);

  /**
   * Discard the current timer without saving
   */
  const discard = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      isRunning: false,
      startTime: null,
      elapsedSeconds: 0,
      projectLabel: '',
    });
  }, []);

  /**
   * Update the project label for the running timer
   */
  const setProjectLabel = useCallback((label: string) => {
    if (state.startTime) {
      const stored: StoredTimer = {
        startTime: state.startTime.toISOString(),
        projectLabel: label,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    }
    setState(prev => ({ ...prev, projectLabel: label }));
  }, [state.startTime]);

  return {
    isRunning: state.isRunning,
    elapsedSeconds: state.elapsedSeconds,
    projectLabel: state.projectLabel,
    displayTime: formatTimerDisplay(state.elapsedSeconds),
    decimalHours: secondsToDecimalHours(state.elapsedSeconds),
    start,
    stop,
    discard,
    setProjectLabel,
  };
}
