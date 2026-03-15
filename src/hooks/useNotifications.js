import { useEffect, useRef } from 'react';

export function useNotifications(events) {
  const timersRef = useRef([]);

  useEffect(() => {
    // Request permission on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    // Clear previous timers
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];

    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    const now = Date.now();

    events.forEach(event => {
      if (!event.reminder || event.reminder === 'none' || !event.time || !event.date) return;

      const eventTime = new Date(`${event.date}T${event.time}`).getTime();
      const reminderMs = parseInt(event.reminder) * 60 * 1000;
      const notifyAt = eventTime - reminderMs;
      const delay = notifyAt - now;

      // Only schedule if in the future and within 24 hours
      if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
        const timer = setTimeout(() => {
          new Notification(`🔔 ${event.title}`, {
            body: `En ${event.reminder === '1440' ? '1 día' : event.reminder === '60' ? '1 hora' : event.reminder + ' minutos'} - ${event.time}`,
            icon: '/favicon.ico',
            tag: event.id,
          });
        }, delay);
        timersRef.current.push(timer);
      }
    });

    return () => {
      timersRef.current.forEach(t => clearTimeout(t));
    };
  }, [events]);
}
