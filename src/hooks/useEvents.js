import { useState, useEffect, useMemo, useCallback } from 'react';
import { addDays, addWeeks, addMonths, format } from 'date-fns';
import { db } from '../services/firebase';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
} from 'firebase/firestore';

const LOCAL_STORAGE_KEY = 'familia-calendar-events';
const LOCAL_CATEGORIES_KEY = 'familia-calendar-categories';

// Expand recurring and multi-day events into individual date entries
function expandEvents(rawEvents) {
  const expanded = [];
  const horizon = new Date();
  horizon.setFullYear(horizon.getFullYear() + 1);
  const horizonStr = format(horizon, 'yyyy-MM-dd');

  rawEvents.forEach(event => {
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
    } else if (event.recurrence && event.recurrence !== 'none') {
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
    } else {
      expanded.push(event);
    }
  });

  return expanded;
}

export function useEvents() {
  const [rawEvents, setRawEvents] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Listen to Firestore events in real-time
  useEffect(() => {
    const unsubEvents = onSnapshot(collection(db, 'events'), (snapshot) => {
      const firebaseEvents = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
      setRawEvents(firebaseEvents);
      setLoaded(true);
    });

    const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const firebaseCategories = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
      setCustomCategories(firebaseCategories);
    });

    return () => { unsubEvents(); unsubCategories(); };
  }, []);

  // Migrate localStorage data to Firebase (one-time)
  useEffect(() => {
    if (!loaded) return;

    const localEvents = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (localEvents) {
      const parsed = JSON.parse(localEvents);
      if (parsed.length > 0 && rawEvents.length === 0) {
        const batch = writeBatch(db);
        parsed.forEach(event => {
          const { id, ...data } = event;
          const ref = doc(collection(db, 'events'));
          batch.set(ref, { ...data, _oldId: id });
        });
        batch.commit().then(() => {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          console.log('Events migrated to Firebase');
        });
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }

    const localCategories = localStorage.getItem(LOCAL_CATEGORIES_KEY);
    if (localCategories) {
      const parsed = JSON.parse(localCategories);
      if (parsed.length > 0 && customCategories.length === 0) {
        const batch = writeBatch(db);
        parsed.forEach(cat => {
          const { id, ...data } = cat;
          const ref = doc(collection(db, 'categories'));
          batch.set(ref, { ...data, _oldId: id });
        });
        batch.commit().then(() => {
          localStorage.removeItem(LOCAL_CATEGORIES_KEY);
          console.log('Categories migrated to Firebase');
        });
      } else {
        localStorage.removeItem(LOCAL_CATEGORIES_KEY);
      }
    }
  }, [loaded]);

  const events = useMemo(() => expandEvents(rawEvents), [rawEvents]);

  const addEvent = useCallback((event) => {
    const newEvent = {
      ...event,
      createdAt: new Date().toISOString(),
    };
    // Remove undefined values (Firestore doesn't accept them)
    const clean = Object.fromEntries(
      Object.entries(newEvent).filter(([, v]) => v !== undefined)
    );
    addDoc(collection(db, 'events'), clean);
    return { ...clean, id: 'temp-' + Date.now() };
  }, []);

  const updateEvent = useCallback((id, updates) => {
    const clean = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    updateDoc(doc(db, 'events', id), clean);
  }, []);

  const deleteEvent = useCallback((id) => {
    deleteDoc(doc(db, 'events', id));
  }, []);

  const getEventsForDate = useCallback((date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(e => e.date === dateStr).sort((a, b) => {
      if (!a.time) return 1;
      if (!b.time) return -1;
      return a.time.localeCompare(b.time);
    });
  }, [events]);

  const getEventsForMonth = useCallback((year, month) => {
    return events.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }, [events]);

  const getEventsForWeek = useCallback((startDate) => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    return events.filter(e => e.date >= startStr && e.date <= endStr);
  }, [events]);

  const getUpcomingEvents = useCallback((days = 7) => {
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
  }, [events]);

  const addCategory = useCallback((category) => {
    const { id, ...data } = category;
    addDoc(collection(db, 'categories'), data);
    return { ...data, id: 'temp-' + Date.now() };
  }, []);

  const removeCategory = useCallback((id) => {
    deleteDoc(doc(db, 'categories', id));
  }, []);

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
