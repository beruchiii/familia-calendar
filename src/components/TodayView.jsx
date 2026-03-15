import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getMemberById } from '../data/familyConfig';
import { DEFAULT_CATEGORIES } from '../data/familyConfig';
import { getDaysUntil } from '../hooks/useBirthdays';
import EventCard from './EventCard';

export default function TodayView({ events, currentDate, onEventClick, allCategories, birthdays = [] }) {
  const viewDate = currentDate || new Date();
  const dateStr = viewDate.toISOString().split('T')[0];
  const dayEvents = events.filter(e => e.date === dateStr);

  const realToday = new Date().toISOString().split('T')[0];
  const isRealToday = dateStr === realToday;

  // Get upcoming events (next 7 days from viewDate)
  const upcoming = [];
  for (let i = 1; i <= 7; i++) {
    const d = new Date(viewDate);
    d.setDate(d.getDate() + i);
    const dStr = d.toISOString().split('T')[0];
    const dEvents = events.filter(e => e.date === dStr);
    upcoming.push(...dEvents);
  }

  // Filter birthdays within next 30 days
  const upcomingBirthdays = birthdays
    .map(b => ({ ...b, daysUntil: getDaysUntil(b.date) }))
    .filter(b => b.daysUntil <= 30)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  return (
    <div className="today-view">
      <div className="today-greeting">
        <h2>
          {format(viewDate, "EEEE d 'de' MMMM", { locale: es })}
        </h2>
        <p className="today-summary">
          {dayEvents.length === 0
            ? `No hay citas ${isRealToday ? 'hoy' : 'este día'}`
            : `${dayEvents.length} cita${dayEvents.length > 1 ? 's' : ''} ${isRealToday ? 'hoy' : ''}`}
        </p>
      </div>

      {dayEvents.length > 0 && (
        <div className="section">
          <h3 className="section-title">{isRealToday ? 'Hoy' : format(viewDate, "EEEE d", { locale: es })}</h3>
          <div className="events-list">
            {dayEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => onEventClick(event)}
                allCategories={allCategories}
              />
            ))}
          </div>
        </div>
      )}

      {upcomingBirthdays.length > 0 && (
        <div className="section birthday-countdown-section">
          <h3 className="section-title">🎂 Cumpleaños y Aniversarios</h3>
          <div className="birthday-countdown-list">
            {upcomingBirthdays.map(b => (
              <div
                key={b.id}
                className={`birthday-countdown-item ${b.daysUntil === 0 ? 'birthday-today' : ''}`}
              >
                <span className="birthday-countdown-emoji">{b.emoji || '🎂'}</span>
                <div className="birthday-countdown-info">
                  <span className="birthday-countdown-name">{b.name}</span>
                  <span className="birthday-countdown-type">
                    {b.type === 'aniversario' ? 'Aniversario' : 'Cumpleaños'}
                  </span>
                </div>
                <span className={`birthday-badge ${b.daysUntil === 0 ? 'birthday-badge-today' : ''}`}>
                  {b.daysUntil === 0 ? '¡Hoy! 🎉' : `Faltan ${b.daysUntil} día${b.daysUntil !== 1 ? 's' : ''}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="section">
          <h3 className="section-title">Próximos días</h3>
          <div className="events-list">
            {upcoming.map(event => (
              <EventCard
                key={event.id}
                event={event}
                showDate
                onClick={() => onEventClick(event)}
                allCategories={allCategories}
              />
            ))}
          </div>
        </div>
      )}

      {dayEvents.length === 0 && upcoming.length === 0 && upcomingBirthdays.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">📅</span>
          <p>No hay citas próximas</p>
          <p className="empty-hint">Pulsa + para añadir una</p>
        </div>
      )}
    </div>
  );
}
