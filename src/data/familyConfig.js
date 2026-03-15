export const FAMILY_MEMBERS = [
  {
    id: 'papa',
    name: 'Papá',
    emoji: '👨',
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    borderColor: '#93C5FD',
    isChild: false,
  },
  {
    id: 'mama',
    name: 'Mamá',
    emoji: '👩',
    color: '#EC4899',
    bgColor: '#FDF2F8',
    borderColor: '#F9A8D4',
    isChild: false,
  },
  {
    id: 'berardo',
    name: 'Berardo Jr.',
    emoji: '👦',
    color: '#10B981',
    bgColor: '#ECFDF5',
    borderColor: '#6EE7B7',
    isChild: true,
  },
  {
    id: 'giselle',
    name: 'Giselle',
    emoji: '👧',
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    borderColor: '#C4B5FD',
    isChild: true,
  },
  {
    id: 'chaplin',
    name: 'Chaplin',
    emoji: '🐶',
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    borderColor: '#FCD34D',
    isChild: false,
  },
];

export const DEFAULT_CATEGORIES = [
  { id: 'medica', name: 'Médica', emoji: '🏥', color: '#EF4444' },
  { id: 'ocio', name: 'Ocio', emoji: '🎉', color: '#F59E0B' },
  { id: 'cumpleanos', name: 'Cumpleaños', emoji: '🎂', color: '#F97316' },
  { id: 'fisio', name: 'Fisio', emoji: '💪', color: '#06B6D4' },
  { id: 'cren', name: 'CREN', emoji: '👩‍⚕️', color: '#14B8A6' },
  { id: 'logopeda', name: 'Bea Logopeda', emoji: '🗣️', color: '#6366F1' },
  { id: 'ortopedia', name: 'Ortopedia', emoji: '🦴', color: '#8B5CF6' },
  { id: 'candelaria', name: 'Citas Candelaria', emoji: '📋', color: '#D946EF' },
  { id: 'colegio', name: 'Colegio', emoji: '🏫', color: '#0EA5E9' },
  { id: 'veterinario', name: 'Veterinario', emoji: '🐾', color: '#84CC16' },
];

// Google Calendar IDs to sync
// El calendario principal es "Alia Abdelhamid" (aliaam2405@gmail.com)
export const GOOGLE_CALENDARS = [
  {
    id: 'aliaam2405@gmail.com',
    name: 'Alia Abdelhamid',
    label: 'Calendario principal',
    color: '#3B82F6',
    isPrimary: true,
  },
];

export const getMemberById = (id) => FAMILY_MEMBERS.find(m => m.id === id);
export const getMemberColor = (id) => {
  const member = getMemberById(id);
  return member ? member.color : '#6B7280';
};
