import { useState, useEffect } from 'react';
import { CloudOff, Cloud, RefreshCw, LogIn } from 'lucide-react';
import { isConfigured, initGapi, authorize, isAuthorized, listCalendarEvents } from '../services/googleCalendar';
import { GOOGLE_CALENDARS } from '../data/familyConfig';

export default function GoogleCalendarSync({ onSyncEvents }) {
  const [configured] = useState(isConfigured());
  const [authorized, setAuthorized] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    if (configured) {
      initGapi().then(() => {
        setAuthorized(isAuthorized());
      });
    }
  }, [configured]);

  const handleAuthorize = async () => {
    try {
      await authorize();
      setAuthorized(true);
      handleSync();
    } catch (err) {
      console.error('Auth error:', err);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const now = new Date();
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      const threeMonthsAhead = new Date(now);
      threeMonthsAhead.setMonth(threeMonthsAhead.getMonth() + 3);

      // Sync all configured calendars
      const allEvents = [];
      for (const cal of GOOGLE_CALENDARS) {
        try {
          const events = await listCalendarEvents(oneMonthAgo, threeMonthsAhead, cal.id);
          allEvents.push(...events.map(e => ({ ...e, calendarSource: cal.name })));
        } catch (err) {
          console.error(`Error syncing calendar ${cal.name}:`, err);
        }
      }

      onSyncEvents(allEvents);
      setLastSync(new Date());
    } catch (err) {
      console.error('Sync error:', err);
    } finally {
      setSyncing(false);
    }
  };

  if (!configured) {
    return (
      <div className="sync-status sync-not-configured">
        <CloudOff size={16} />
        <span>Google Calendar no configurado</span>
      </div>
    );
  }

  if (!authorized) {
    return (
      <button className="sync-btn sync-login" onClick={handleAuthorize}>
        <LogIn size={16} />
        <span>Conectar Google Calendar</span>
      </button>
    );
  }

  return (
    <div className="sync-status sync-connected">
      <button
        className={`sync-btn ${syncing ? 'sync-spinning' : ''}`}
        onClick={handleSync}
        disabled={syncing}
      >
        <RefreshCw size={16} />
        <span>{syncing ? 'Sincronizando...' : 'Sincronizar'}</span>
      </button>
      {lastSync && (
        <span className="sync-time">
          <Cloud size={12} />
          {lastSync.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
    </div>
  );
}
