import { useState, useRef, useCallback } from 'react';
import { Plus, Trash2, ChevronLeft, Pin, PinOff, Camera, Paperclip, Mic, MicOff, Search, X, Square, CheckSquare, FileText, Image, Play, Pause, Type } from 'lucide-react';
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

const SPEEDS = [1, 1.5, 2];

function AudioPlayer({ src, transcript }) {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [showTranscript, setShowTranscript] = useState(false);
  const audioRef = useRef(null);

  const toggle = (e) => {
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      if (audio.ended) audio.currentTime = 0;
      audio.playbackRate = speed;
      audio.play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    }
  };

  const cycleSpeed = (e) => {
    e.stopPropagation();
    const nextIdx = (SPEEDS.indexOf(speed) + 1) % SPEEDS.length;
    const newSpeed = SPEEDS[nextIdx];
    setSpeed(newSpeed);
    if (audioRef.current) audioRef.current.playbackRate = newSpeed;
  };

  return (
    <div className="note-audio-player-wrap" onClick={e => e.stopPropagation()}>
      <div className="note-audio-player">
        <audio
          ref={audioRef}
          src={src}
          preload="auto"
          onEnded={() => setPlaying(false)}
          onPause={() => setPlaying(false)}
          onPlay={() => setPlaying(true)}
          onError={() => setPlaying(false)}
        />
        <button className="audio-play-btn" onClick={toggle}>
          {playing ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <span className="audio-label">Nota de voz</span>
        <button className="audio-speed-btn" onClick={cycleSpeed}>
          {speed}x
        </button>
        {transcript && (
          <button
            className="audio-transcript-btn"
            onClick={(e) => { e.stopPropagation(); setShowTranscript(s => !s); }}
            title="Ver transcripción"
          >
            <Type size={14} />
          </button>
        )}
      </div>
      {showTranscript && transcript && (
        <div className="audio-transcript">
          <p>{transcript}</p>
        </div>
      )}
    </div>
  );
}

export default function NotesView({ notes, onAdd, onUpdate, onDelete }) {
  const [editingNote, setEditingNote] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState({
    title: '', content: '', color: 'yellow', member: '', pinned: false,
    photos: [], documents: [], audios: [], checklist: [],
  });
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const speechRecRef = useRef(null);
  const transcriptRef = useRef('');
  const photoInputRef = useRef(null);
  const docInputRef = useRef(null);

  const emptyForm = {
    title: '', content: '', color: 'yellow', member: '', pinned: false,
    photos: [], documents: [], audios: [], checklist: [],
  };

  const filteredNotes = searchQuery.trim()
    ? notes.filter(n => {
        const q = searchQuery.toLowerCase();
        return (n.title || '').toLowerCase().includes(q) ||
               (n.content || '').toLowerCase().includes(q) ||
               n.checklist?.some(item => item.text.toLowerCase().includes(q));
      })
    : notes;

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  const openNew = () => {
    setEditingNote(null);
    setForm({ ...emptyForm });
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
      photos: note.photos || [],
      documents: note.documents || [],
      audios: note.audios || [],
      checklist: note.checklist || [],
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.content.trim() && !form.title.trim() && form.checklist.length === 0
        && form.photos.length === 0 && form.audios.length === 0) return;
    if (editingNote) {
      onUpdate(editingNote.id, form);
    } else {
      onAdd(form);
    }
    setShowForm(false);
    setEditingNote(null);
  };

  const handleDelete = (id) => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    onDelete(id);
    setShowForm(false);
    setEditingNote(null);
    setConfirmDelete(false);
  };

  const toggleSelectNote = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    selectedIds.forEach(id => onDelete(id));
    setSelectedIds([]);
    setSelectMode(false);
    setConfirmDelete(false);
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds([]);
    setConfirmDelete(false);
  };

  const handleMemberSelect = (memberId) => {
    setForm(prev => {
      const newMember = prev.member === memberId ? '' : memberId;
      const member = FAMILY_MEMBERS.find(m => m.id === memberId);
      // Auto-fill title with member name if title is empty or was a previous auto-fill
      const prevMember = FAMILY_MEMBERS.find(m => m.id === prev.member);
      const wasAutoTitle = !prev.title || (prevMember && prev.title === prevMember.name);
      const newTitle = newMember && wasAutoTitle && member ? member.name : (newMember ? prev.title : (wasAutoTitle ? '' : prev.title));
      return { ...prev, member: newMember, title: newTitle };
    });
  };

  const handleTogglePin = () => {
    setForm(prev => ({ ...prev, pinned: !prev.pinned }));
  };

  // Checklist
  const addCheckItem = () => {
    setForm(prev => ({
      ...prev,
      checklist: [...prev.checklist, { text: '', checked: false, id: Date.now() }],
    }));
  };

  const updateCheckItem = (id, updates) => {
    setForm(prev => ({
      ...prev,
      checklist: prev.checklist.map(item => item.id === id ? { ...item, ...updates } : item),
    }));
  };

  const removeCheckItem = (id) => {
    setForm(prev => ({
      ...prev,
      checklist: prev.checklist.filter(item => item.id !== id),
    }));
  };

  // Audio recording with speech-to-text
  const streamRef = useRef(null);
  const recordStartRef = useRef(0);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = ['audio/mp4', 'audio/webm', 'audio/ogg'].find(
        t => MediaRecorder.isTypeSupported(t)
      ) || '';
      const options = mimeType ? { mimeType } : {};
      const mediaRecorder = new MediaRecorder(stream, options);
      const actualMime = mediaRecorder.mimeType || mimeType || 'audio/webm';
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      transcriptRef.current = '';

      // Start speech recognition if available (non-blocking)
      try {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRec) {
          const recognition = new SpeechRec();
          recognition.lang = 'es-ES';
          recognition.continuous = true;
          recognition.interimResults = false;
          recognition.onresult = (event) => {
            let text = '';
            for (let i = 0; i < event.results.length; i++) {
              if (event.results[i].isFinal) {
                text += event.results[i][0].transcript + ' ';
              }
            }
            transcriptRef.current = text.trim();
          };
          recognition.onerror = () => {
            speechRecRef.current = null;
          };
          recognition.onend = () => {
            speechRecRef.current = null;
          };
          recognition.start();
          speechRecRef.current = recognition;
        }
      } catch {
        // Speech recognition not available, continue without it
        speechRecRef.current = null;
      }

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        // Stop speech recognition
        if (speechRecRef.current) {
          try { speechRecRef.current.stop(); } catch {}
          speechRecRef.current = null;
        }
        const transcript = transcriptRef.current || '';
        const blob = new Blob(chunksRef.current, { type: actualMime });
        const reader = new FileReader();
        reader.onload = (ev) => {
          setForm(prev => ({
            ...prev,
            audios: [...prev.audios, {
              data: ev.target.result,
              duration: Math.round((Date.now() - recordStartRef.current) / 1000),
              createdAt: new Date().toISOString(),
              transcript: transcript || undefined,
            }],
          }));
        };
        reader.readAsDataURL(blob);
        // Stop all tracks
        stream.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      };

      recordStartRef.current = Date.now();
      mediaRecorder.start();
      setRecording(true);
    } catch {
      alert('No se pudo acceder al micrófono');
    }
  };

  const stopRecording = () => {
    setRecording(false);
    // Stop speech recognition first
    if (speechRecRef.current) {
      try { speechRecRef.current.stop(); } catch {}
      speechRecRef.current = null;
    }
    // Stop media recorder
    if (mediaRecorderRef.current) {
      try {
        if (mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      } catch {
        // Force cleanup if stop fails
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
          streamRef.current = null;
        }
      }
      mediaRecorderRef.current = null;
    }
  };

  // Photo handling
  const handlePhotos = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxSize = 800;
          let w = img.width, h = img.height;
          if (w > maxSize || h > maxSize) {
            if (w > h) { h = (h / w) * maxSize; w = maxSize; }
            else { w = (w / h) * maxSize; h = maxSize; }
          }
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL('image/jpeg', 0.7);
          setForm(prev => ({ ...prev, photos: [...prev.photos, compressed] }));
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  // Document handling
  const handleDocs = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} es demasiado grande (máx 5MB)`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm(prev => ({
          ...prev,
          documents: [...prev.documents, {
            name: file.name, type: file.type, size: file.size, data: ev.target.result,
          }],
        }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const getColor = (colorId) => NOTE_COLORS.find(c => c.id === colorId) || NOTE_COLORS[0];
  const getMember = (memberId) => FAMILY_MEMBERS.find(m => m.id === memberId);

  // ===== EDITOR VIEW =====
  if (showForm) {
    return (
      <div className="notes-editor">
        <div className="notes-editor-header">
          <button className="btn-icon" onClick={() => { setShowForm(false); stopRecording(); setConfirmDelete(false); }}>
            <ChevronLeft size={20} />
          </button>
          <h3>{editingNote ? 'Editar nota' : 'Nueva nota'}</h3>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="btn-icon" onClick={handleTogglePin} title={form.pinned ? 'Desfijar' : 'Fijar'}>
              {form.pinned ? <PinOff size={18} /> : <Pin size={18} />}
            </button>
            {editingNote && (
              confirmDelete ? (
                <button className="btn-danger-confirm" onClick={() => handleDelete(editingNote.id)}>
                  Confirmar borrar
                </button>
              ) : (
                <button className="btn-icon btn-icon-danger" onClick={() => handleDelete(editingNote.id)}>
                  <Trash2 size={18} />
                </button>
              )
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
            onClick={() => handleMemberSelect('')}
          >
            Todos
          </button>
          {FAMILY_MEMBERS.map(m => (
            <button
              key={m.id}
              className={`member-chip-mini ${form.member === m.id ? 'member-chip-mini-active' : ''}`}
              style={form.member === m.id ? { backgroundColor: m.color, color: '#fff' } : {}}
              onClick={() => handleMemberSelect(m.id)}
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

        {/* Checklist */}
        {form.checklist.length > 0 && (
          <div className="note-checklist">
            {form.checklist.map(item => (
              <div key={item.id} className="checklist-item">
                <button
                  type="button"
                  className="checklist-check"
                  onClick={() => updateCheckItem(item.id, { checked: !item.checked })}
                >
                  {item.checked ? <CheckSquare size={18} className="checklist-checked" /> : <Square size={18} />}
                </button>
                <input
                  type="text"
                  className={`checklist-input ${item.checked ? 'checklist-done' : ''}`}
                  placeholder="Tarea..."
                  value={item.text}
                  onChange={e => updateCheckItem(item.id, { text: e.target.value })}
                  autoComplete="off"
                />
                <button className="checklist-remove" onClick={() => removeCheckItem(item.id)}>
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Photos in editor */}
        {form.photos.length > 0 && (
          <div className="note-attachments">
            <div className="photo-grid">
              {form.photos.map((photo, idx) => (
                <div key={idx} className="photo-thumb">
                  <img src={photo} alt={`Foto ${idx + 1}`} />
                  <button
                    type="button"
                    className="photo-remove"
                    onClick={() => setForm(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== idx) }))}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Audios in editor */}
        {form.audios.length > 0 && (
          <div className="note-attachments">
            {form.audios.map((audio, idx) => (
              <div key={idx} className="note-audio-item">
                <AudioPlayer src={audio.data} transcript={audio.transcript} />
                <span className="audio-duration">{audio.duration}s</span>
                <button
                  className="checklist-remove"
                  onClick={() => setForm(prev => ({ ...prev, audios: prev.audios.filter((_, i) => i !== idx) }))}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Documents in editor */}
        {form.documents.length > 0 && (
          <div className="note-attachments">
            {form.documents.map((doc, idx) => (
              <div key={idx} className="doc-item">
                <FileText size={16} />
                <span className="doc-name">{doc.name}</span>
                <span className="doc-size">{(doc.size / 1024).toFixed(0)} KB</span>
                <button
                  className="checklist-remove"
                  onClick={() => setForm(prev => ({ ...prev, documents: prev.documents.filter((_, i) => i !== idx) }))}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div className="notes-toolbar">
          <button className="toolbar-btn" onClick={() => photoInputRef.current?.click()} title="Foto">
            <Camera size={20} />
          </button>
          <button
            className={`toolbar-btn ${recording ? 'toolbar-btn-recording' : ''}`}
            onClick={recording ? stopRecording : startRecording}
            title={recording ? 'Parar grabación' : 'Grabar audio'}
          >
            {recording ? <MicOff size={20} /> : <Mic size={20} />}
            {recording && <span className="recording-dot" />}
          </button>
          <button className="toolbar-btn" onClick={() => docInputRef.current?.click()} title="Documento">
            <Paperclip size={20} />
          </button>
          <button className="toolbar-btn" onClick={addCheckItem} title="Lista de tareas">
            <CheckSquare size={20} />
          </button>
        </div>

        <button className="btn-save-big" onClick={handleSave}>
          Guardar nota
        </button>

        <input ref={photoInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePhotos} />
        <input ref={docInputRef} type="file" accept=".pdf,.doc,.docx,.txt,.xls,.xlsx" multiple style={{ display: 'none' }} onChange={handleDocs} />
      </div>
    );
  }

  // ===== LIST VIEW =====
  return (
    <div className="notes-view">
      <div className="notes-header">
        {selectMode ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button className="btn-icon" onClick={exitSelectMode}>
                <X size={20} />
              </button>
              <h3>{selectedIds.length} seleccionada{selectedIds.length !== 1 ? 's' : ''}</h3>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn-icon-header"
                onClick={() => {
                  if (selectedIds.length === sortedNotes.length) setSelectedIds([]);
                  else setSelectedIds(sortedNotes.map(n => n.id));
                }}
              >
                <CheckSquare size={20} />
              </button>
              {selectedIds.length > 0 && (
                confirmDelete ? (
                  <button className="btn-danger-confirm" onClick={handleBulkDelete}>
                    Confirmar ({selectedIds.length})
                  </button>
                ) : (
                  <button className="btn-icon-header btn-icon-danger-header" onClick={handleBulkDelete}>
                    <Trash2 size={20} />
                  </button>
                )
              )}
            </div>
          </>
        ) : (
          <>
            <h3>Notas</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              {sortedNotes.length > 0 && (
                <button className="btn-icon-header" onClick={() => setSelectMode(true)}>
                  <CheckSquare size={20} />
                </button>
              )}
              <button className="btn-icon-header" onClick={() => { setShowSearch(s => !s); if (showSearch) setSearchQuery(''); }}>
                {showSearch ? <X size={20} /> : <Search size={20} />}
              </button>
              <button className="btn-add-note" onClick={openNew}>
                <Plus size={18} />
              </button>
            </div>
          </>
        )}
      </div>

      {showSearch && (
        <div className="search-bar" style={{ margin: '0 0 12px' }}>
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Buscar notas..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            autoFocus
            autoComplete="off"
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')}>
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {sortedNotes.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📝</span>
          <p>{searchQuery ? 'No se encontraron notas' : 'No hay notas todavía'}</p>
          {!searchQuery && <p className="empty-hint">Toca + para crear tu primera nota</p>}
        </div>
      ) : (
        <div className="notes-grid">
          {sortedNotes.map(note => {
            const color = getColor(note.color);
            const member = getMember(note.member);
            const hasMedia = (note.photos?.length > 0) || (note.audios?.length > 0) || (note.documents?.length > 0);
            const checklist = note.checklist || [];
            const checkDone = checklist.filter(i => i.checked).length;
            return (
              <div
                key={note.id}
                className={`note-card ${selectMode && selectedIds.includes(note.id) ? 'note-card-selected' : ''}`}
                style={{
                  '--note-bg-light': color.bg,
                  '--note-bg-dark': color.dark,
                  borderColor: selectedIds.includes(note.id) ? 'var(--accent)' : color.border,
                }}
                onClick={() => selectMode ? toggleSelectNote(note.id) : openEdit(note)}
                onContextMenu={(e) => { e.preventDefault(); if (!selectMode) { setSelectMode(true); setSelectedIds([note.id]); } }}
              >
                {selectMode && (
                  <span className="note-select-check">
                    {selectedIds.includes(note.id) ? <CheckSquare size={18} className="checklist-checked" /> : <Square size={18} />}
                  </span>
                )}
                {!selectMode && note.pinned && <span className="note-pin">📌</span>}
                {note.title && <h4 className="note-card-title">{note.title}</h4>}
                {note.content && <p className="note-card-content">{note.content}</p>}

                {/* Preview first photo */}
                {note.photos?.length > 0 && (
                  <div className="note-card-photo">
                    <img src={note.photos[0]} alt="" />
                    {note.photos.length > 1 && (
                      <span className="note-photo-count">+{note.photos.length - 1}</span>
                    )}
                  </div>
                )}

                {/* Checklist preview */}
                {checklist.length > 0 && (
                  <div className="note-card-checklist">
                    {checklist.slice(0, 3).map(item => (
                      <div key={item.id} className="mini-check-item">
                        {item.checked ? <CheckSquare size={12} className="checklist-checked" /> : <Square size={12} />}
                        <span className={item.checked ? 'checklist-done' : ''}>{item.text || 'Tarea'}</span>
                      </div>
                    ))}
                    {checklist.length > 3 && (
                      <span className="mini-check-more">+{checklist.length - 3} más</span>
                    )}
                  </div>
                )}

                <div className="note-card-footer">
                  {member && (
                    <span className="note-member-badge" style={{ backgroundColor: member.color }}>
                      {member.emoji}
                    </span>
                  )}
                  {note.audios?.length > 0 && <span className="note-media-badge">🎙️</span>}
                  {note.documents?.length > 0 && <span className="note-media-badge">📎</span>}
                  {note.photos?.length > 0 && checklist.length > 0 && <span className="note-media-badge">📷</span>}
                  {checklist.length > 0 && (
                    <span className="note-check-count">{checkDone}/{checklist.length}</span>
                  )}
                  <span className="note-card-date">
                    {format(new Date(note.updatedAt), "d MMM HH:mm", { locale: es })}
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
