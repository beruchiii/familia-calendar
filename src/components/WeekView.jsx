import { format, addDays, startOfWeek, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { getMemberById } from '../data/familyConfig';

export default function WeekView({ date, events, onDayClick, allCategories }) {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="week-view">
      {days.map(day => {
        const dateStr = day.toISOString().split('T')[0];
        const dayEvents = events
          .filter(e => e.date === dateStr)
          .sort((a, b) => {
            if (!a.time) return 1;
            if (!b.time) return -1;
            return a.time.localeCompare(b.time);
          });

        return (
          <div
            key={dateStr}
            className={`week-day ${isToday(day) ? 'week-day-today' : ''}`}
            onClick={() => onDayClick(day)}
          >
            <div className="week-day-header">
              <span className="week-day-name">
                {format(day, 'EEE', { locale: es })}
              </span>
              <span className={`week-day-number ${isToday(day) ? 'today-number' : ''}`}>
                {format(day, 'd')}
              </span>
            </div>

            <div className="week-day-events">
              {dayEvents.slice(0, 3).map(event => {
                const member = getMemberById(event.members?.[0]);
                const category = allCategories.find(c => c.id === event.category);
                return (
                  <div
                    key={event.id}
                    className="week-event-dot"
                    style={{ backgroundColor: member?.color || '#6B7280' }}
                  >
                    <span className="week-event-text">
                      {event.time && <span className="week-event-time">{event.time}</span>}
                      {' '}{category?.emoji} {event.title}
                    </span>
                  </div>
                );
              })}
              {dayEvents.length > 3 && (
                <span className="week-more">+{dayEvents.length - 3} más</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
