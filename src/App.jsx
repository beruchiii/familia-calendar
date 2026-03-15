import { useState, useMemo, useCallback } from 'react';
import { addDays, addWeeks, addMonths } from 'date-fns';
import Header from './components/Header';
import TodayView from './components/TodayView';
import DayView from './components/DayView';
import WeekView from './components/WeekView';
import MonthView from './components/MonthView';
import EventForm from './components/EventForm';
import EventDetail from './components/EventDetail';
import FilterBar from './components/FilterBar';
import GoogleCalendarSync from './components/GoogleCalendarSync';
import { useEvents } from './hooks/useEvents';
import { DEFAULT_CATEGORIES } from './data/familyConfig';
import { isConfigured, createCalendarEvent } from './services/googleCalendar';
import './App.css';

function App() {
  const [view, setView] = useState('today');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editEvent, setEditEvent] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);
  const [formInitialDate, setFormInitialDate] = useState(null);

  const {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    getUpcomingEvents,
    customCategories,
    addCategory,
  } = useEvents();

  const allCategories = useMemo(
    () => [...DEFAULT_CATEGORIES, ...customCategories],
    [customCategories]
  );

  const filteredEvents = useMemo(() => {
    if (activeFilters.length === 0) return events;
    return events.filter(e =>
      e.members?.some(m => activeFilters.includes(m))
    );
  }, [events, activeFilters]);

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

  return (
    <div className="app">
      <Header
        view={view}
        onViewChange={handleViewChange}
        currentDate={currentDate}
        onNavigate={handleNavigate}
        onNewEvent={handleNewEvent}
      />

      <GoogleCalendarSync onSyncEvents={handleSyncEvents} />
      <FilterBar activeFilters={activeFilters} onToggleFilter={handleToggleFilter} />

      <main className="main-content">
        {view === 'today' && (
          <TodayView
            events={filteredEvents}
            upcomingEvents={getUpcomingEvents(7).filter(e =>
              activeFilters.length === 0 || e.members?.some(m => activeFilters.includes(m))
            )}
            onEventClick={handleEventClick}
            allCategories={allCategories}
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
          />
        )}
      </main>

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
    </div>
  );
}

export default App;
