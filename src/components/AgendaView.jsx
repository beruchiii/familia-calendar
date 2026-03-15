import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import EventCard from './EventCard';

export default function AgendaView({ events, onEventClick, allCategories }) {
  const today = new Date().toISOString().split('T')[0];

  // Get events from today forward, sorted by date
  const upcomingEvents = events
    .filter(e => e.date >= today)
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      if (!a.time) return 1;
      if (!b.time) return -1;
      return a.time.localeCompare(b.time);
    });

  // Group by date
  const grouped = {};
  upcomingEvents.forEach(event => {
    if (!grouped[event.date]) grouped[event.date] = [];
    grouped[event.date].push(event);
  });

  const dates = Object.keys(grouped).sort();

  return (
    <div className="agenda-view">
      {dates.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">📋</span>
          <p>No hay citas próximas</p>
          <p className="empty-hint">Pulsa + para añadir una</p>
        </div>
      )}

      {dates.map(dateStr => {
        const dayEvents = grouped[dateStr];
        const dateObj = new Date(dateStr + 'T12:00:00');
        const isToday = dateStr === today;

        return (
          <div key={dateStr} className="agenda-day">
            <div className={`agenda-date-header ${isToday ? 'agenda-date-today' : ''}`}>
              <span className="agenda-date-day">{format(dateObj, 'd')}</span>
              <div className="agenda-date-info">
                <span className="agenda-date-weekday">
                  {format(dateObj, 'EEEE', { locale: es })}
                </span>
                <span className="agenda-date-month">
                  {format(dateObj, "MMMM yyyy", { locale: es })}
                </span>
              </div>
              {isToday && <span className="agenda-today-badge">Hoy</span>}
            </div>
            <div className="events-list">
              {dayEvents.map(event => (
                <EventCard
                  key={event.id + '-' + event.date}
                  event={event}
                  onClick={() => onEventClick(event)}
                  allCategories={allCategories}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
