import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { X, Pencil, Trash2 } from 'lucide-react';
import { getMemberById } from '../data/familyConfig';

export default function EventDetail({ event, onClose, onEdit, onDelete, allCategories }) {
  const members = (event.members || []).map(getMemberById).filter(Boolean);
  const category = allCategories.find(c => c.id === event.category);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{event.title}</h3>
          <div className="modal-actions">
            <button className="btn-icon" onClick={() => onEdit(event)}>
              <Pencil size={18} />
            </button>
            <button className="btn-icon btn-icon-danger" onClick={() => onDelete(event.id)}>
              <Trash2 size={18} />
            </button>
            <button className="btn-icon" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="event-detail-body">
          <div className="detail-row">
            <span className="detail-label">📅 Fecha</span>
            <span>{format(new Date(event.date + 'T12:00:00'), "EEEE d 'de' MMMM yyyy", { locale: es })}</span>
          </div>

          {event.time && (
            <div className="detail-row">
              <span className="detail-label">🕐 Hora</span>
              <span>{event.time}</span>
            </div>
          )}

          <div className="detail-row">
            <span className="detail-label">👥 Personas</span>
            <div className="detail-members">
              {members.map(m => (
                <span
                  key={m.id}
                  className={`detail-member-tag ${m.isChild ? 'detail-member-child' : ''}`}
                  style={{ backgroundColor: m.bgColor, color: m.color, borderColor: m.borderColor }}
                >
                  {m.emoji} {m.name}
                </span>
              ))}
            </div>
          </div>

          {category && (
            <div className="detail-row">
              <span className="detail-label">🏷️ Categoría</span>
              <span className="category-tag" style={{ backgroundColor: category.color + '20', color: category.color }}>
                {category.emoji} {category.name}
              </span>
            </div>
          )}

          {event.notes && (
            <div className="detail-row detail-notes">
              <span className="detail-label">📝 Notas</span>
              <p>{event.notes}</p>
            </div>
          )}

          <div className="detail-row">
            <span className="detail-label">🔄 Sincronización</span>
            <span>{event.syncCalendar ? '📅 App + Google Calendar' : '📱 Solo en la App'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
