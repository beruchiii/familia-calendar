import { Calendar, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Header({ view, onViewChange, currentDate, onNavigate, onNewEvent }) {
  const getTitle = () => {
    if (view === 'day') return format(currentDate, "EEEE d 'de' MMMM", { locale: es });
    if (view === 'week') return `Semana del ${format(currentDate, "d 'de' MMM", { locale: es })}`;
    if (view === 'month') return format(currentDate, "MMMM yyyy", { locale: es });
    return format(currentDate, "EEEE d 'de' MMMM", { locale: es });
  };

  return (
    <header className="header">
      <div className="header-top">
        <div className="header-brand">
          <Calendar size={24} />
          <span className="header-title">FamiliApp</span>
        </div>
        <button className="btn-add" onClick={onNewEvent}>
          <Plus size={20} />
        </button>
      </div>

      <div className="header-nav">
        <button className="nav-arrow" onClick={() => onNavigate(-1)}>
          <ChevronLeft size={20} />
        </button>
        <h2 className="nav-title">{getTitle()}</h2>
        <button className="nav-arrow" onClick={() => onNavigate(1)}>
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="view-tabs">
        {['today', 'day', 'week', 'month'].map(v => (
          <button
            key={v}
            className={`view-tab ${view === v ? 'active' : ''}`}
            onClick={() => onViewChange(v)}
          >
            {v === 'today' ? 'Hoy' : v === 'day' ? 'Día' : v === 'week' ? 'Semana' : 'Mes'}
          </button>
        ))}
      </div>
    </header>
  );
}
