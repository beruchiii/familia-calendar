import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isToday,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { getMemberById } from '../data/familyConfig';

export default function MonthView({ date, events, onDayClick }) {
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

  return (
    <div className="month-view">
      <div className="month-grid-header">
        {weekDays.map(d => (
          <span key={d} className="month-weekday">{d}</span>
        ))}
      </div>

      <div className="month-grid">
        {days.map(day => {
          const dateStr = day.toISOString().split('T')[0];
          const dayEvents = events.filter(e => e.date === dateStr);
          const inMonth = isSameMonth(day, date);

          return (
            <div
              key={dateStr}
              className={`month-cell ${!inMonth ? 'month-cell-outside' : ''} ${isToday(day) ? 'month-cell-today' : ''}`}
              onClick={() => onDayClick(day)}
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
    </div>
  );
}
