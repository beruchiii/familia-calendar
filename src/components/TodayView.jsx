import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getMemberById } from '../data/familyConfig';
import { DEFAULT_CATEGORIES } from '../data/familyConfig';
import EventCard from './EventCard';

export default function TodayView({ events, upcomingEvents, onEventClick, allCategories }) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const todayEvents = events.filter(e => e.date === todayStr);
  const futureEvents = upcomingEvents.filter(e => e.date > todayStr);

  return (
    <div className="today-view">
      <div className="today-greeting">
        <h2>
          {format(today, "EEEE d 'de' MMMM", { locale: es })}
        </h2>
        <p className="today-summary">
          {todayEvents.length === 0
            ? 'No hay citas hoy'
            : `${todayEvents.length} cita${todayEvents.length > 1 ? 's' : ''} hoy`}
        </p>
      </div>

      {todayEvents.length > 0 && (
        <div className="section">
          <h3 className="section-title">Hoy</h3>
          <div className="events-list">
            {todayEvents.map(event => (
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

      {futureEvents.length > 0 && (
        <div className="section">
          <h3 className="section-title">Próximos días</h3>
          <div className="events-list">
            {futureEvents.map(event => (
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

      {todayEvents.length === 0 && futureEvents.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">📅</span>
          <p>No hay citas próximas</p>
          <p className="empty-hint">Pulsa + para añadir una</p>
        </div>
      )}
    </div>
  );
}
