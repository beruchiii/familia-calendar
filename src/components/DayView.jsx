import EventCard from './EventCard';

const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7:00 - 21:00

export default function DayView({ date, events, onEventClick, allCategories }) {
  const dateStr = date.toISOString().split('T')[0];
  const dayEvents = events
    .filter(e => e.date === dateStr)
    .sort((a, b) => {
      if (!a.time) return 1;
      if (!b.time) return -1;
      return a.time.localeCompare(b.time);
    });

  const allDayEvents = dayEvents.filter(e => !e.time);
  const timedEvents = dayEvents.filter(e => e.time);

  return (
    <div className="day-view">
      {allDayEvents.length > 0 && (
        <div className="all-day-section">
          <span className="all-day-label">Todo el día</span>
          {allDayEvents.map(event => (
            <EventCard key={event.id} event={event} onClick={() => onEventClick(event)} allCategories={allCategories} />
          ))}
        </div>
      )}

      <div className="day-timeline">
        {HOURS.map(hour => {
          const hourStr = hour.toString().padStart(2, '0');
          const hourEvents = timedEvents.filter(e => e.time?.startsWith(hourStr));

          return (
            <div key={hour} className="timeline-row">
              <span className="timeline-hour">{hourStr}:00</span>
              <div className="timeline-content">
                <div className="timeline-line" />
                {hourEvents.map(event => (
                  <EventCard
                    key={event.id}
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

      {dayEvents.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">✨</span>
          <p>Día libre</p>
        </div>
      )}
    </div>
  );
}
