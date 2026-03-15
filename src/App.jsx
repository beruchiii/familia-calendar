import { useState, useMemo, useCallback } from 'react';
import { addDays, addWeeks, addMonths } from 'date-fns';
import Header from './components/Header';
import SplashScreen from './components/SplashScreen';
import TodayView from './components/TodayView';
import DayView from './components/DayView';
import WeekView from './components/WeekView';
import MonthView from './components/MonthView';
import AgendaView from './components/AgendaView';
import EventForm from './components/EventForm';
import EventDetail from './components/EventDetail';
import FilterBar from './components/FilterBar';
import GoogleCalendarSync from './components/GoogleCalendarSync';
import NotesView from './components/NotesView';
import ShoppingList from './components/ShoppingList';
import BirthdaySection from './components/BirthdaySection';
import { useEvents } from './hooks/useEvents';
import { useNotes } from './hooks/useNotes';
import { useShoppingList } from './hooks/useShoppingList';
import { useBirthdays } from './hooks/useBirthdays';
import { DEFAULT_CATEGORIES } from './data/familyConfig';
import { isConfigured, createCalendarEvent } from './services/googleCalendar';
import { useDarkMode } from './hooks/useDarkMode';
import { useNotifications } from './hooks/useNotifications';
import './App.css';

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    // Show splash only once per session
    if (sessionStorage.getItem('splash-shown')) return false;
    sessionStorage.setItem('splash-shown', '1');
    return true;
  });
  const [appMode, setAppMode] = useState('calendar'); // 'calendar' | 'notes' | 'shopping'
  const [view, setView] = useState('today');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editEvent, setEditEvent] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);
  const [formInitialDate, setFormInitialDate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, toggleDarkMode] = useDarkMode();
  const [showBirthdays, setShowBirthdays] = useState(false);

  const {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    getUpcomingEvents,
    customCategories,
    addCategory,
  } = useEvents();

  const { notes, addNote, updateNote, deleteNote } = useNotes();
  const { birthdays, addBirthday, updateBirthday, deleteBirthday } = useBirthdays();
  const { items: shoppingItems, addItem: addShoppingItem, toggleItem: toggleShoppingItem, deleteItem: deleteShoppingItem, clearCompleted: clearShoppingCompleted } = useShoppingList();

  useNotifications(events);

  const allCategories = useMemo(
    () => [...DEFAULT_CATEGORIES, ...customCategories],
    [customCategories]
  );

  const filteredEvents = useMemo(() => {
    let filtered = events;
    if (activeFilters.length > 0) {
      filtered = filtered.filter(e =>
        e.members?.some(m => activeFilters.includes(m))
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.title?.toLowerCase().includes(q) ||
        e.notes?.toLowerCase().includes(q) ||
        allCategories.find(c => c.id === e.category)?.name.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [events, activeFilters, searchQuery, allCategories]);

  const handleNavigate = (direction) => {
    setCurrentDate(prev => {
      if (view === 'day' || view === 'today') return addDays(prev, direction);
      if (view === 'week') return addWeeks(prev, direction);
      if (view === 'month') return addMonths(prev, direction);
      return prev;
    });
  };

  const handleViewChange = (newView) => {
    if (newView === 'today') setCurrentDate(new Date());
    setView(newView);
  };

  const handleDayClick = (day) => {
    setCurrentDate(day);
    setView('day');
  };

  const handleNewEvent = () => {
    setEditEvent(null);
    setFormInitialDate(currentDate.toISOString().split('T')[0]);
    setShowForm(true);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const handleSubmitEvent = async (formData) => {
    if (editEvent) {
      updateEvent(editEvent.id, formData);
    } else {
      const newEvent = addEvent(formData);
      // Sync to Google Calendar if enabled and configured
      if (formData.syncCalendar && isConfigured()) {
        try {
          const gEvent = await createCalendarEvent(formData);
          updateEvent(newEvent.id, { googleEventId: gEvent.id });
        } catch (err) {
          console.error('Failed to sync to Google Calendar:', err);
        }
      }
    }
    setShowForm(false);
    setEditEvent(null);
  };

  const handleSyncEvents = useCallback((googleEvents) => {
    // Merge Google Calendar events with local events
    googleEvents.forEach(gEvent => {
      const existing = events.find(e => e.googleEventId === gEvent.googleEventId);
      if (!existing) {
        addEvent({ ...gEvent, syncCalendar: true });
      }
    });
  }, [events, addEvent]);

  const handleEditEvent = (event) => {
    setSelectedEvent(null);
    setEditEvent(event);
    setShowForm(true);
  };

  const handleDeleteEvent = (id) => {
    deleteEvent(id);
    setSelectedEvent(null);
  };

  const handleToggleFilter = (memberId) => {
    if (memberId === null) {
      setActiveFilters([]);
    } else {
      setActiveFilters(prev =>
        prev.includes(memberId)
          ? prev.filter(id => id !== memberId)
          : [...prev, memberId]
      );
    }
  };

  if (showSplash) {
    return <SplashScreen onDone={() => setShowSplash(false)} />;
  }

  return (
    <div className="app">
      <Header
        view={view}
        onViewChange={handleViewChange}
        currentDate={currentDate}
        onNavigate={handleNavigate}
        onNewEvent={handleNewEvent}
        darkMode={darkMode}
        onToggleDark={toggleDarkMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        appMode={appMode}
        onAppModeChange={setAppMode}
        onShowBirthdays={() => setShowBirthdays(true)}
      />

      {appMode === 'calendar' && (
        <>
          <GoogleCalendarSync onSyncEvents={handleSyncEvents} />
          <FilterBar activeFilters={activeFilters} onToggleFilter={handleToggleFilter} />

          <main className="main-content">
            {view === 'today' && (
              <TodayView
                events={filteredEvents}
                currentDate={currentDate}
                onEventClick={handleEventClick}
                allCategories={allCategories}
                birthdays={birthdays}
              />
            )}
            {view === 'day' && (
              <DayView
                date={currentDate}
                events={filteredEvents}
                onEventClick={handleEventClick}
                allCategories={allCategories}
              />
            )}
            {view === 'week' && (
              <WeekView
                date={currentDate}
                events={filteredEvents}
                onDayClick={handleDayClick}
                allCategories={allCategories}
              />
            )}
            {view === 'month' && (
              <MonthView
                date={currentDate}
                events={filteredEvents}
                onDayClick={handleDayClick}
                onEventClick={handleEventClick}
                allCategories={allCategories}
              />
            )}
            {view === 'agenda' && (
              <AgendaView
                events={filteredEvents}
                onEventClick={handleEventClick}
                allCategories={allCategories}
              />
            )}
          </main>
        </>
      )}

      {appMode === 'notes' && (
        <main className="main-content">
          <NotesView
            notes={notes}
            onAdd={addNote}
            onUpdate={updateNote}
            onDelete={deleteNote}
          />
        </main>
      )}

      {appMode === 'shopping' && (
        <main className="main-content">
          <ShoppingList
            items={shoppingItems}
            onAdd={addShoppingItem}
            onToggle={toggleShoppingItem}
            onDelete={deleteShoppingItem}
            onClearCompleted={clearShoppingCompleted}
          />
        </main>
      )}

      {showForm && (
        <EventForm
          onSubmit={handleSubmitEvent}
          onClose={() => { setShowForm(false); setEditEvent(null); }}
          initialDate={formInitialDate}
          customCategories={customCategories}
          onAddCategory={addCategory}
          editEvent={editEvent}
        />
      )}

      {selectedEvent && (
        <EventDetail
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
          allCategories={allCategories}
        />
      )}

      {showBirthdays && (
        <BirthdaySection
          birthdays={birthdays}
          addBirthday={addBirthday}
          updateBirthday={updateBirthday}
          deleteBirthday={deleteBirthday}
          onClose={() => setShowBirthdays(false)}
        />
      )}
    </div>
  );
}

export default App;
