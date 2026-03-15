import { useState, useMemo } from 'react';
import { Plus, Trash2, CheckCircle, Circle } from 'lucide-react';

const CATEGORIES = [
  { id: 'Fruta', emoji: '🍎', label: 'Fruta' },
  { id: 'Carne', emoji: '🥩', label: 'Carne' },
  { id: 'Lácteos', emoji: '🥛', label: 'Lácteos' },
  { id: 'Limpieza', emoji: '🧹', label: 'Limpieza' },
  { id: 'Otros', emoji: '📦', label: 'Otros' },
];

const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

export default function ShoppingList({ items, onAdd, onToggle, onDelete, onClearCompleted }) {
  const [newItem, setNewItem] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Otros');

  const handleAdd = () => {
    if (!newItem.trim()) return;
    onAdd(newItem, selectedCategory);
    setNewItem('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAdd();
  };

  const checkedCount = items.filter(i => i.checked).length;
  const totalCount = items.length;

  const grouped = useMemo(() => {
    const unchecked = items.filter(i => !i.checked);
    const checked = items.filter(i => i.checked);

    const groups = {};
    CATEGORIES.forEach(c => { groups[c.id] = []; });

    unchecked.forEach(item => {
      const cat = item.category || 'Otros';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });

    // Filter out empty groups for unchecked
    const activeGroups = CATEGORIES
      .filter(c => groups[c.id].length > 0)
      .map(c => ({ ...c, items: groups[c.id] }));

    return { activeGroups, checked };
  }, [items]);

  return (
    <div className="shopping-list">
      <div className="shopping-counter">
        {checkedCount} de {totalCount} completados
      </div>

      <div className="shopping-input-bar">
        <input
          type="text"
          className="shopping-input"
          placeholder="Agregar producto..."
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        <button className="shopping-add-btn" onClick={handleAdd} disabled={!newItem.trim()}>
          <Plus size={20} />
        </button>
      </div>

      <div className="shopping-categories">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`shopping-cat-pill ${selectedCategory === cat.id ? 'shopping-cat-active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      <div className="shopping-items">
        {grouped.activeGroups.map(group => (
          <div key={group.id} className="shopping-group">
            <div className="shopping-group-header">
              {group.emoji} {group.label}
            </div>
            {group.items.map(item => (
              <div key={item.id} className="shopping-item">
                <button className="shopping-check" onClick={() => onToggle(item.id, item.checked)}>
                  <Circle size={20} />
                </button>
                <span className="shopping-item-name">{item.name}</span>
                <button className="shopping-delete" onClick={() => onDelete(item.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ))}

        {grouped.checked.length > 0 && (
          <div className="shopping-group">
            <div className="shopping-group-header shopping-group-done">
              ✅ Completados
            </div>
            {grouped.checked.map(item => (
              <div key={item.id} className="shopping-item checked">
                <button className="shopping-check" onClick={() => onToggle(item.id, item.checked)}>
                  <CheckCircle size={20} />
                </button>
                <span className="shopping-item-name">{item.name}</span>
                <button className="shopping-delete" onClick={() => onDelete(item.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {totalCount === 0 && (
          <div className="shopping-empty">
            🛒 La lista está vacía. ¡Agrega productos!
          </div>
        )}
      </div>

      {checkedCount > 0 && (
        <button className="shopping-clear-btn" onClick={onClearCompleted}>
          🗑️ Limpiar completados ({checkedCount})
        </button>
      )}
    </div>
  );
}
