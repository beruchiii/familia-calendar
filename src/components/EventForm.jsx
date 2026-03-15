import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { FAMILY_MEMBERS, DEFAULT_CATEGORIES } from '../data/familyConfig';

export default function EventForm({ onSubmit, onClose, initialDate, customCategories, onAddCategory, editEvent }) {
  const allCategories = [...DEFAULT_CATEGORIES, ...customCategories];

  const [form, setForm] = useState({
    title: editEvent?.title || '',
    date: editEvent?.date || initialDate || new Date().toISOString().split('T')[0],
    time: editEvent?.time || '',
    members: editEvent?.members || [],
    category: editEvent?.category || '',
    notes: editEvent?.notes || '',
    syncCalendar: editEvent?.syncCalendar ?? true,
  });

  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('📌');

  const toggleMember = (id) => {
    setForm(prev => ({
      ...prev,
      members: prev.members.includes(id)
        ? prev.members.filter(m => m !== id)
        : [...prev.members, id],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || form.members.length === 0) return;
    onSubmit(form);
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    onAddCategory({
      name: newCatName.trim(),
      emoji: newCatEmoji,
      color: '#6B7280',
    });
    setNewCatName('');
    setNewCatEmoji('📌');
    setShowNewCategory(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{editEvent ? 'Editar cita' : 'Nueva cita'}</h3>
          <button className="btn-icon" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="event-form">
          {/* Family Members */}
          <div className="form-section">
            <label className="form-label">¿Para quién?</label>
            <div className="member-selector">
              {FAMILY_MEMBERS.map(member => (
                <button
                  key={member.id}
                  type="button"
                  className={`member-chip ${member.isChild ? 'member-chip-child' : ''} ${form.members.includes(member.id) ? 'member-chip-active' : ''}`}
                  style={form.members.includes(member.id) ? {
                    backgroundColor: member.color,
                    borderColor: member.color,
                    color: '#fff',
                  } : {}}
                  onClick={() => toggleMember(member.id)}
                >
                  <span className="member-chip-emoji">{member.emoji}</span>
                  <span>{member.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="form-section">
            <label className="form-label">¿Qué?</label>
            <input
              type="text"
              className="form-input"
              placeholder="Revisión, cumple de Lucía..."
              value={form.title}
              onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
              autoFocus
            />
          </div>

          {/* Date & Time */}
          <div className="form-row">
            <div className="form-section form-flex">
              <label className="form-label">¿Cuándo?</label>
              <input
                type="date"
                className="form-input"
                value={form.date}
                onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="form-section form-flex">
              <label className="form-label">¿Hora?</label>
              <input
                type="time"
                className="form-input"
                value={form.time}
                onChange={e => setForm(prev => ({ ...prev, time: e.target.value }))}
              />
            </div>
          </div>

          {/* Category */}
          <div className="form-section">
            <label className="form-label">Categoría</label>
            <div className="category-grid">
              {allCategories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  className={`category-chip ${form.category === cat.id ? 'category-chip-active' : ''}`}
                  style={form.category === cat.id ? {
                    backgroundColor: cat.color + '20',
                    borderColor: cat.color,
                    color: cat.color,
                  } : {}}
                  onClick={() => setForm(prev => ({ ...prev, category: cat.id }))}
                >
                  {cat.emoji} {cat.name}
                </button>
              ))}
              <button
                type="button"
                className="category-chip category-chip-add"
                onClick={() => setShowNewCategory(true)}
              >
                <Plus size={14} /> Nueva
              </button>
            </div>

            {showNewCategory && (
              <div className="new-category-row">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Emoji"
                  value={newCatEmoji}
                  onChange={e => setNewCatEmoji(e.target.value)}
                  style={{ width: '60px', textAlign: 'center' }}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nombre categoría"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="button" className="btn-small" onClick={handleAddCategory}>
                  Añadir
                </button>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="form-section">
            <label className="form-label">Notas</label>
            <textarea
              className="form-input form-textarea"
              placeholder="Llevar informes, ir en ayunas..."
              value={form.notes}
              onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          {/* Sync Option */}
          <div className="form-section">
            <label className="sync-toggle">
              <input
                type="checkbox"
                checked={form.syncCalendar}
                onChange={e => setForm(prev => ({ ...prev, syncCalendar: e.target.checked }))}
              />
              <span className="sync-toggle-slider" />
              <span className="sync-toggle-label">
                {form.syncCalendar ? '📅 Guardar en App + Google Calendar' : '📱 Solo en la App'}
              </span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn-submit"
            disabled={!form.title.trim() || form.members.length === 0}
          >
            {editEvent ? 'Guardar cambios' : 'Crear cita'}
          </button>
        </form>
      </div>
    </div>
  );
}
