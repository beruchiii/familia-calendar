import { FAMILY_MEMBERS } from '../data/familyConfig';

export default function FilterBar({ activeFilters, onToggleFilter }) {
  return (
    <div className="filter-bar">
      <button
        className={`filter-chip ${activeFilters.length === 0 ? 'filter-chip-active' : ''}`}
        onClick={() => onToggleFilter(null)}
      >
        Todos
      </button>
      {FAMILY_MEMBERS.map(member => (
        <button
          key={member.id}
          className={`filter-chip ${activeFilters.includes(member.id) ? 'filter-chip-active' : ''}`}
          style={activeFilters.includes(member.id) ? {
            backgroundColor: member.color,
            color: '#fff',
            borderColor: member.color,
          } : {}}
          onClick={() => onToggleFilter(member.id)}
        >
          {member.emoji} {member.name}
        </button>
      ))}
    </div>
  );
}
