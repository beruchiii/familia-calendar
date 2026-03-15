import { useState } from 'react';
import { Calendar, Plus, ChevronLeft, ChevronRight, Sun, Moon, Search, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Header({ view, onViewChange, currentDate, onNavigate, onNewEvent, darkMode, onToggleDark, searchQuery, onSearchChange }) {
  const [showSearch, setShowSearch] = useState(false);

  const getTitle = () => {
    if (view === 'agenda') return 'Agenda';
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
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button className="btn-icon-header" onClick={() => { setShowSearch(s => !s); if (showSearch) onSearchChange(''); }}>
            {showSearch ? <X size={20} /> : <Search size={20} />}
          </button>
          <button className="btn-icon-header" onClick={onToggleDark}>
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="btn-add" onClick={onNewEvent}>
            <Plus size={20} />
          </button>
        </div>
      </div>

      {showSearch && (
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Buscar citas..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            autoFocus
            autoComplete="off"
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => onSearchChange('')}>
              <X size={16} />
            </button>
          )}
        </div>
      )}

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
        {['today', 'day', 'week', 'month', 'agenda'].map(v => (
          <button
            key={v}
            className={`view-tab ${view === v ? 'active' : ''}`}
            onClick={() => onViewChange(v)}
          >
            {{today: 'Hoy', day: 'Día', week: 'Semana', month: 'Mes', agenda: 'Agenda'}[v]}
          </button>
        ))}
      </div>
    </header>
  );
}
