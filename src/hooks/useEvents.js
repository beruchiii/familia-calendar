import { useState, useEffect } from 'react';

const STORAGE_KEY = 'familia-calendar-events';
const CATEGORIES_KEY = 'familia-calendar-categories';

export function useEvents() {
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [customCategories, setCustomCategories] = useState(() => {
    const saved = localStorage.getItem(CATEGORIES_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(customCategories));
  }, [customCategories]);

  const addEvent = (event) => {
    const newEvent = {
      ...event,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      createdAt: new Date().toISOString(),
    };
    setEvents(prev => [...prev, newEvent]);
    return newEvent;
  };

  const updateEvent = (id, updates) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteEvent = (id) => {
    setEvents(prev => prev.filter(e => e.id !== id));
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
