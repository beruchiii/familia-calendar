import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, CheckSquare, Clock, ChevronRight } from 'lucide-react';
import { getMemberById } from '../data/familyConfig';

export default function DailySummary({ events, notes, onGoToNotes }) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const todayEvents = events.filter(e => e.date === todayStr);
  const sortedEvents = [...todayEvents].sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  // Tomorrow
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const tomorrowEvents = events.filter(e => e.date === tomorrowStr);

  // Pending checklist items from notes
  const pendingTasks = [];
  notes.forEach(note => {
    if (note.checklist?.length > 0) {
      const pending = note.checklist.filter(item => !item.checked);
      if (pending.length > 0) {
        pendingTasks.push({
          noteTitle: note.title || 'Sin título',
          noteMember: note.member,
          items: pending,
        });
      }
    }
  });
  const totalPending = pendingTasks.reduce((sum, t) => sum + t.items.length, 0);

  const hour = today.getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="daily-summary">
      <div className="summary-greeting">
        <h2>{greeting} 👋</h2>
        <p className="summary-date">{format(today, "EEEE d 'de' MMMM", { locale: es })}</p>
      </div>

      {/* Today's events */}
      <div className="summary-card summary-card-events">
        <div className="summary-card-header">
          <Calendar size={18} className="summary-card-icon" />
          <span className="summary-card-label">Hoy</span>
          <span className="summary-card-count">{todayEvents.length} cita{todayEvents.length !== 1 ? 's' : ''}</span>
        </div>
        {sortedEvents.length > 0 ? (
          <div className="summary-events-list">
            {sortedEvents.slice(0, 3).map(event => {
              const members = (event.members || []).map(getMemberById).filter(Boolean);
              return (
                <div key={event.id} className="summary-event-item">
                  {event.time && <span className="summary-event-time">{event.time}</span>}
                  <span className="summary-event-title">{event.title}</span>
                  <span className="summary-event-members">
                    {members.map(m => m.emoji).join(' ')}
                  </span>
                </div>
              );
            })}
            {sortedEvents.length > 3 && (
              <span className="summary-more">+{sortedEvents.length - 3} más</span>
            )}
          </div>
        ) : (
          <p className="summary-empty">Sin citas hoy</p>
        )}
      </div>

      {/* Tomorrow preview */}
      {tomorrowEvents.length > 0 && (
        <div className="summary-card summary-card-tomorrow">
          <div className="summary-card-header">
            <Clock size={18} className="summary-card-icon" />
            <span className="summary-card-label">Mañana</span>
            <span className="summary-card-count">{tomorrowEvents.length} cita{tomorrowEvents.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="summary-events-list">
            {tomorrowEvents.slice(0, 2).map(event => {
              const members = (event.members || []).map(getMemberById).filter(Boolean);
              return (
                <div key={event.id} className="summary-event-item">
                  {event.time && <span className="summary-event-time">{event.time}</span>}
                  <span className="summary-event-title">{event.title}</span>
                  <span className="summary-event-members">
                    {members.map(m => m.emoji).join(' ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pending tasks from notes */}
      {totalPending > 0 && (
        <div className="summary-card summary-card-tasks" onClick={onGoToNotes}>
          <div className="summary-card-header">
            <CheckSquare size={18} className="summary-card-icon" />
            <span className="summary-card-label">Tareas pendientes</span>
            <span className="summary-card-count">{totalPending}</span>
            <ChevronRight size={16} className="summary-chevron" />
          </div>
          <div className="summary-tasks-list">
            {pendingTasks.slice(0, 2).map((task, idx) => {
              const member = task.noteMember ? getMemberById(task.noteMember) : null;
              return (
                <div key={idx} className="summary-task-item">
                  {member && <span>{member.emoji}</span>}
                  <span className="summary-task-title">{task.noteTitle}</span>
                  <span className="summary-task-count">{task.items.length} pendiente{task.items.length > 1 ? 's' : ''}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
