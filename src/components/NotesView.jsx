import { useState } from 'react';
import { Plus, Trash2, X, ChevronLeft, Pin, PinOff } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FAMILY_MEMBERS } from '../data/familyConfig';

const NOTE_COLORS = [
  { id: 'yellow', bg: '#FEF9C3', dark: '#854D0E20', border: '#F59E0B' },
  { id: 'blue', bg: '#DBEAFE', dark: '#1E40AF20', border: '#3B82F6' },
  { id: 'green', bg: '#DCFCE7', dark: '#16653420', border: '#22C55E' },
  { id: 'pink', bg: '#FCE7F3', dark: '#9D174D20', border: '#EC4899' },
  { id: 'purple', bg: '#F3E8FF', dark: '#6B21A820', border: '#A855F7' },
  { id: 'white', bg: '#FFFFFF', dark: '#1E293B', border: '#E2E8F0' },
];

export default function NotesView({ notes, onAdd, onUpdate, onDelete }) {
  const [editingNote, setEditingNote] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', color: 'yellow', member: '', pinned: false });

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  const openNew = () => {
    setEditingNote(null);
    setForm({ title: '', content: '', color: 'yellow', member: '', pinned: false });
    setShowForm(true);
  };

  const openEdit = (note) => {
    setEditingNote(note);
    setForm({
      title: note.title || '',
      content: note.content || '',
      color: note.color || 'yellow',
      member: note.member || '',
      pinned: note.pinned || false,
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.content.trim() && !form.title.trim()) return;
    if (editingNote) {
      onUpdate(editingNote.id, form);
    } else {
      onAdd(form);
    }
    setShowForm(false);
    setEditingNote(null);
  };

  const handleDelete = (id) => {
    onDelete(id);
    setShowForm(false);
    setEditingNote(null);
  };

  const getColor = (colorId) => NOTE_COLORS.find(c => c.id === colorId) || NOTE_COLORS[0];
  const getMember = (memberId) => FAMILY_MEMBERS.find(m => m.id === memberId);

  if (showForm) {
    return (
      <div className="notes-editor">
        <div className="notes-editor-header">
          <button className="btn-icon" onClick={() => setShowForm(false)}>
            <ChevronLeft size={20} />
          </button>
          <h3>{editingNote ? 'Editar nota' : 'Nueva nota'}</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            {editingNote && (
              <button className="btn-icon btn-icon-danger" onClick={() => handleDelete(editingNote.id)}>
                <Trash2 size={18} />
              </button>
            )}
            <button className="btn-small" onClick={handleSave}>Guardar</button>
          </div>
        </div>

        <div className="notes-color-picker">
          {NOTE_COLORS.map(c => (
            <button
              key={c.id}
              className={`note-color-dot ${form.color === c.id ? 'note-color-active' : ''}`}
              style={{ backgroundColor: c.bg, borderColor: c.border }}
              onClick={() => setForm(prev => ({ ...prev, color: c.id }))}
            />
          ))}
        </div>

        <div className="notes-member-picker">
          <button
            className={`member-chip-mini ${!form.member ? 'member-chip-mini-active' : ''}`}
            onClick={() => setForm(prev => ({ ...prev, member: '' }))}
          >
            Todos
          </button>
          {FAMILY_MEMBERS.map(m => (
            <button
              key={m.id}
              className={`member-chip-mini ${form.member === m.id ? 'member-chip-mini-active' : ''}`}
              style={form.member === m.id ? { backgroundColor: m.color, color: '#fff' } : {}}
              onClick={() => setForm(prev => ({ ...prev, member: m.id }))}
            >
              {m.emoji}
            </button>
          ))}
        </div>

        <input
          type="text"
          className="form-input notes-title-input"
          placeholder="Título (opcional)"
          value={form.title}
          onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
          autoComplete="off"
        />
        <textarea
          className="form-input notes-content-input"
          placeholder="Escribe tu nota..."
          value={form.content}
          onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))}
          autoFocus
          autoComplete="off"
        />
      </div>
    );
  }

  return (
    <div className="notes-view">
      <div className="notes-header">
        <h3>Notas</h3>
        <button className="btn-add-note" onClick={openNew}>
          <Plus size={18} />
        </button>
      </div>

      {sortedNotes.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📝</span>
          <p>No hay notas todavía</p>
          <p className="empty-hint">Toca + para crear tu primera nota</p>
        </div>
      ) : (
        <div className="notes-grid">
          {sortedNotes.map(note => {
            const color = getColor(note.color);
            const member = getMember(note.member);
            return (
              <div
                key={note.id}
                className="note-card"
                style={{
                  '--note-bg-light': color.bg,
                  '--note-bg-dark': color.dark,
                  borderColor: color.border,
                }}
                onClick={() => openEdit(note)}
              >
                {note.pinned && <span className="note-pin">📌</span>}
                {note.title && <h4 className="note-card-title">{note.title}</h4>}
                <p className="note-card-content">{note.content}</p>
                <div className="note-card-footer">
                  {member && (
                    <span className="note-member-badge" style={{ backgroundColor: member.color }}>
                      {member.emoji}
                    </span>
                  )}
                  <span className="note-card-date">
                    {format(new Date(note.updatedAt), "d MMM", { locale: es })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
