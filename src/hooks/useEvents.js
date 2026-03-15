import { useState, useEffect, useMemo } from 'react';
import { addDays, addWeeks, addMonths, format } from 'date-fns';

const STORAGE_KEY = 'familia-calendar-events';
const CATEGORIES_KEY = 'familia-calendar-categories';

// Expand recurring and multi-day events into individual date entries
function expandEvents(rawEvents) {
  const expanded = [];
  const horizon = new Date();
  horizon.setFullYear(horizon.getFullYear() + 1); // expand 1 year ahead
  const horizonStr = format(horizon, 'yyyy-MM-dd');

  rawEvents.forEach(event => {
    // Multi-day event: generate one entry per day in range
    if (event.endDate && event.endDate > event.date) {
      let current = new Date(event.date + 'T12:00:00');
      const end = new Date(event.endDate + 'T12:00:00');
      while (current <= end) {
        const dateStr = format(current, 'yyyy-MM-dd');
        expanded.push({
          ...event,
          date: dateStr,
          _originalDate: event.date,
          _isMultiDay: true,
          _multiDayLabel: `${event.date} → ${event.endDate}`,
        });
        current = addDays(current, 1);
      }
    }
    // Recurring event
    else if (event.recurrence && event.recurrence !== 'none') {
      let current = new Date(event.date + 'T12:00:00');
      let count = 0;
      const maxOccurrences = 200;

      while (format(current, 'yyyy-MM-dd') <= horizonStr && count < maxOccurrences) {
        const dateStr = format(current, 'yyyy-MM-dd');
        expanded.push({
          ...event,
          date: dateStr,
          _originalDate: event.date,
          _isRecurring: true,
        });
        count++;

        if (event.recurrence === 'daily') current = addDays(current, 1);
        else if (event.recurrence === 'weekly') current = addWeeks(current, 1);
        else if (event.recurrence === 'biweekly') current = addWeeks(current, 2);
        else if (event.recurrence === 'monthly') current = addMonths(current, 1);
        else break;
      }
    }
    // Normal single event
    else {
      expanded.push(event);
    }
  });

  return expanded;
}

export function useEvents() {
  const [rawEvents, setRawEvents] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [customCategories, setCustomCategories] = useState(() => {
    const saved = localStorage.getItem(CATEGORIES_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rawEvents));
  }, [rawEvents]);

  useEffect(() => {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(customCategories));
  }, [customCategories]);

  // Expanded events for display
  const events = useMemo(() => expandEvents(rawEvents), [rawEvents]);

  const addEvent = (event) => {
    const newEvent = {
      ...event,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      createdAt: new Date().toISOString(),
    };
    setRawEvents(prev => [...prev, newEvent]);
    return newEvent;
  };

  const updateEvent = (id, updates) => {
    setRawEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteEvent = (id) => {
    setRawEvents(prev => prev.filter(e => e.id !== id));
  };

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(e => e.date === dateStr).sort((a, b) => {
      if (!a.time) return 1;
      if (!b.time) return -1;
      return a.time.localeCompare(b.time);
    });
  };

  const getEventsForMonth = (year, month) => {
    return events.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  };

  const getEventsForWeek = (startDate) => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    return events.filter(e => e.date >= startStr && e.date <= endStr);
  };

  const getUpcomingEvents = (days = 7) => {
    const today = new Date().toISOString().split('T')[0];
    const end = new Date();
    end.setDate(end.getDate() + days);
    const endStr = end.toISOString().split('T')[0];
    return events
      .filter(e => e.date >= today && e.date <= endStr)
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        if (!a.time) return 1;
        if (!b.time) return -1;
        return a.time.localeCompare(b.time);
      });
  };

  const addCategory = (category) => {
    const newCat = {
      ...category,
      id: 'custom-' + Date.now().toString(36),
    };
    setCustomCategories(prev => [...prev, newCat]);
    return newCat;
  };

  const removeCategory = (id) => {
    setCustomCategories(prev => prev.filter(c => c.id !== id));
  };

  return {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsForDate,
    getEventsForMonth,
    getEventsForWeek,
    getUpcomingEvents,
    customCategories,
    addCategory,
    removeCategory,
  };
}
