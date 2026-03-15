import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getMemberById, DEFAULT_CATEGORIES } from '../data/familyConfig';

export default function EventCard({ event, showDate, onClick, allCategories }) {
  const members = (event.members || []).map(getMemberById).filter(Boolean);
  const category = allCategories.find(c => c.id === event.category);
  const primaryMember = members[0];
  const isChildEvent = members.some(m => m?.isChild);

  return (
    <div
      className={`event-card ${isChildEvent ? 'event-card-child' : ''}`}
      style={{
        borderLeftColor: primaryMember?.color || '#6B7280',
        backgroundColor: primaryMember?.bgColor || '#F9FAFB',
      }}
      onClick={onClick}
    >
      <div className="event-card-header">
        <div className="event-card-members">
          {members.map(m => (
            <span key={m.id} className="member-badge" style={{ backgroundColor: m.color }}>
              {m.emoji}
            </span>
          ))}
        </div>
        {event.time && <span className="event-time">{event.time}</span>}
      </div>

      <h4 className="event-title">{event.title}</h4>

      <div className="event-card-footer">
        {category && (
          <span className="category-tag" style={{ backgroundColor: category.color + '20', color: category.color }}>
            {category.emoji} {category.name}
          </span>
        )}
        {showDate && (
          <span className="event-date-badge">
            {format(new Date(event.date + 'T12:00:00'), "EEE d MMM", { locale: es })}
          </span>
        )}
        {event.syncCalendar && <span className="sync-badge">📅</span>}
      </div>

      {event.notes && <p className="event-notes">{event.notes}</p>}
    </div>
  );
}
