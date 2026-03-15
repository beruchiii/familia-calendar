import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { getMemberById } from '../data/familyConfig';
import EventCard from './EventCard';

export default function MonthView({ date, events, onDayClick, onEventClick, allCategories }) {
  const [selectedDay, setSelectedDay] = useState(null);

  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = [];
  let current = calStart;
  while (current <= calEnd) {
    days.push(new Date(current));
    current = addDays(current, 1);
  }

  const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  const handleDayClick = (day) => {
    setSelectedDay(prev => prev && isSameDay(prev, day) ? null : day);
  };

  // Get events for selected day
  const selectedDayStr = selectedDay ? format(selectedDay, 'yyyy-MM-dd') : null;
  const selectedDayEvents = selectedDay
    ? events
        .filter(e => e.date === selectedDayStr)
        .sort((a, b) => {
          if (!a.time) return 1;
          if (!b.time) return -1;
          return a.time.localeCompare(b.time);
        })
    : [];

  return (
    <div className="month-view">
      <div className="month-grid-header">
        {weekDays.map(d => (
          <span key={d} className="month-weekday">{d}</span>
        ))}
      </div>

      <div className="month-grid">
        {days.map((day, idx) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayEvents = events.filter(e => e.date === dateStr);
          const inMonth = isSameMonth(day, date);
          const isSelected = selectedDay && isSameDay(day, selectedDay);

          return (
            <div
              key={`${dateStr}-${idx}`}
              className={`month-cell ${!inMonth ? 'month-cell-outside' : ''} ${isToday(day) ? 'month-cell-today' : ''} ${isSelected ? 'month-cell-selected' : ''}`}
              onClick={() => handleDayClick(day)}
            >
              <span className={`month-day-number ${isToday(day) ? 'today-circle' : ''}`}>
                {format(day, 'd')}
              </span>

              <div className="month-cell-dots">
                {dayEvents.slice(0, 3).map(event => {
                  const member = getMemberById(event.members?.[0]);
                  return (
                    <span
                      key={event.id}
                      className="month-dot"
                      style={{ backgroundColor: member?.color || '#6B7280' }}
                    />
                  );
                })}
              </div>

              {dayEvents.length > 0 && (
                <span className="month-event-count">{dayEvents.length}</span>
              )}
            </div>
          );
        })}
      </div>

      {selectedDay && (
        <div className="month-day-detail">
          <h3 className="month-detail-title">
            {format(selectedDay, "EEEE d 'de' MMMM", { locale: es })}
          </h3>
          {selectedDayEvents.length > 0 ? (
            <div className="events-list">
              {selectedDayEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={() => onEventClick(event)}
                  allCategories={allCategories}
                />
              ))}
            </div>
          ) : (
            <p className="month-detail-empty">No hay citas este día</p>
          )}
        </div>
      )}
    </div>
  );
}
