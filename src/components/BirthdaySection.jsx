import { useState } from 'react';
import { X, Plus, Edit3, Trash2, Cake } from 'lucide-react';
import { getDaysUntil } from '../hooks/useBirthdays';

const EMOJI_OPTIONS = ['🎂', '🎉', '🎈', '🎁', '💍', '❤️', '👶', '🌟', '🥳', '🎊', '👨', '👩', '👦', '👧', '🐶'];

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

function formatBirthdayDate(mmdd) {
  const [month, day] = mmdd.split('-').map(Number);
  return `${day} de ${MONTHS[month - 1]}`;
}

function BirthdayForm({ initial, onSubmit, onCancel }) {
  const [name, setName] = useState(initial?.name || '');
  const [month, setMonth] = useState(initial?.date ? initial.date.split('-')[0] : '01');
  const [day, setDay] = useState(initial?.date ? initial.date.split('-')[1] : '01');
  const [emoji, setEmoji] = useState(initial?.emoji || '🎂');
  const [type, setType] = useState(initial?.type || 'cumpleaños');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      date: `${month}-${day}`,
      emoji,
      type,
    });
  };

  const daysInMonth = new Date(2024, parseInt(month), 0).getDate();

  return (
    <form className="birthday-form" onSubmit={handleSubmit}>
      <div className="birthday-form-field">
        <label>Nombre</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nombre de la persona"
          autoFocus
        />
      </div>

      <div className="birthday-form-field">
        <label>Tipo</label>
        <div className="birthday-type-selector">
          <button
            type="button"
            className={`birthday-type-btn ${type === 'cumpleaños' ? 'active' : ''}`}
            onClick={() => setType('cumpleaños')}
          >
            🎂 Cumpleaños
          </button>
          <button
            type="button"
            className={`birthday-type-btn ${type === 'aniversario' ? 'active' : ''}`}
            onClick={() => setType('aniversario')}
          >
            💍 Aniversario
          </button>
        </div>
      </div>

      <div className="birthday-form-field">
        <label>Fecha</label>
        <div className="birthday-date-picker">
          <select value={month} onChange={e => setMonth(e.target.value)}>
            {MONTHS.map((m, i) => (
              <option key={i} value={String(i + 1).padStart(2, '0')}>{m}</option>
            ))}
          </select>
          <select value={day} onChange={e => setDay(e.target.value)}>
            {Array.from({ length: daysInMonth }, (_, i) => (
              <option key={i} value={String(i + 1).padStart(2, '0')}>{i + 1}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="birthday-form-field">
        <label>Emoji</label>
        <div className="birthday-emoji-picker">
          {EMOJI_OPTIONS.map(e => (
            <button
              key={e}
              type="button"
              className={`birthday-emoji-btn ${emoji === e ? 'active' : ''}`}
              onClick={() => setEmoji(e)}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div className="birthday-form-actions">
        <button type="button" className="birthday-btn-cancel" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="birthday-btn-save">
          {initial ? 'Guardar' : 'Añadir'}
        </button>
      </div>
    </form>
  );
}

export default function BirthdaySection({ birthdays, addBirthday, updateBirthday, deleteBirthday, onClose }) {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleAdd = (data) => {
    addBirthday(data);
    setShowForm(false);
  };

  const handleEdit = (data) => {
    updateBirthday(editItem.id, data);
    setEditItem(null);
  };

  const handleDelete = (id) => {
    deleteBirthday(id);
    setConfirmDelete(null);
  };

  return (
    <div className="birthday-modal-overlay" onClick={onClose}>
      <div className="birthday-modal" onClick={e => e.stopPropagation()}>
        <div className="birthday-modal-header">
          <h2><Cake size={20} /> Cumpleaños y Aniversarios</h2>
          <button className="btn-icon-header" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="birthday-modal-body">
          {(showForm || editItem) ? (
            <BirthdayForm
              initial={editItem}
              onSubmit={editItem ? handleEdit : handleAdd}
              onCancel={() => { setShowForm(false); setEditItem(null); }}
            />
          ) : (
            <>
              <button className="birthday-add-btn" onClick={() => setShowForm(true)}>
                <Plus size={18} /> Añadir fecha especial
              </button>

              {birthdays.length === 0 && (
                <div className="birthday-empty">
                  <span className="birthday-empty-icon">🎂</span>
                  <p>No hay fechas registradas</p>
                  <p className="birthday-empty-hint">Añade cumpleaños y aniversarios de tu familia</p>
                </div>
              )}

              <div className="birthday-list">
                {birthdays.map(b => {
                  const days = getDaysUntil(b.date);
                  const isToday = days === 0;

                  return (
                    <div key={b.id} className={`birthday-item ${isToday ? 'birthday-today' : ''}`}>
                      <div className="birthday-item-left">
                        <span className="birthday-item-emoji">{b.emoji || '🎂'}</span>
                        <div className="birthday-item-info">
                          <span className="birthday-item-name">{b.name}</span>
                          <span className="birthday-item-date">
                            {formatBirthdayDate(b.date)} &middot; {b.type === 'aniversario' ? 'Aniversario' : 'Cumpleaños'}
                          </span>
                        </div>
                      </div>
                      <div className="birthday-item-right">
                        <span className={`birthday-badge ${isToday ? 'birthday-badge-today' : ''}`}>
                          {isToday ? '¡Hoy! 🎉' : `${days} día${days !== 1 ? 's' : ''}`}
                        </span>
                        <div className="birthday-item-actions">
                          <button
                            className="birthday-action-btn"
                            onClick={() => setEditItem(b)}
                            title="Editar"
                          >
                            <Edit3 size={14} />
                          </button>
                          {confirmDelete === b.id ? (
                            <button
                              className="birthday-action-btn birthday-action-delete"
                              onClick={() => handleDelete(b.id)}
                              title="Confirmar"
                            >
                              <Trash2 size={14} />
                            </button>
                          ) : (
                            <button
                              className="birthday-action-btn"
                              onClick={() => setConfirmDelete(b.id)}
                              title="Eliminar"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
