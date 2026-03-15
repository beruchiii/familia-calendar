const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';
const SCOPES = 'https://www.googleapis.com/auth/calendar';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

let tokenClient = null;
let gapiInited = false;
let gisInited = false;

export function isConfigured() {
  return Boolean(CLIENT_ID && API_KEY);
}

export async function initGapi() {
  if (!isConfigured()) return false;

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => {
      window.gapi.load('client', async () => {
        await window.gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited = true;
        resolve(true);
      });
    };
    document.head.appendChild(script);

    const gisScript = document.createElement('script');
    gisScript.src = 'https://accounts.google.com/gsi/client';
    gisScript.onload = () => {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '',
      });
      gisInited = true;
    };
    document.head.appendChild(gisScript);
  });
}

export function authorize() {
  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      reject(new Error('Google API not initialized'));
      return;
    }
    tokenClient.callback = (response) => {
      if (response.error) {
        reject(response);
      } else {
        resolve(response);
      }
    };
    if (window.gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      tokenClient.requestAccessToken({ prompt: '' });
    }
  });
}

export function isAuthorized() {
  return window.gapi?.client?.getToken() !== null;
}

export async function createCalendarEvent(event, calendarId = 'primary') {
  const calendarEvent = {
    summary: event.title,
    description: event.notes || '',
    start: event.time
      ? { dateTime: `${event.date}T${event.time}:00`, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }
      : { date: event.date },
    end: event.time
      ? { dateTime: `${event.date}T${event.time}:00`, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }
      : { date: event.date },
    extendedProperties: {
      private: {
        familiaApp: 'true',
        members: JSON.stringify(event.members || []),
        category: event.category || '',
      },
    },
  };

  // Add 1 hour to end time if time is set
  if (event.time) {
    const [hours, minutes] = event.time.split(':').map(Number);
    const endHours = hours + 1;
    calendarEvent.end.dateTime = `${event.date}T${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
  }

  const response = await window.gapi.client.calendar.events.insert({
    calendarId,
    resource: calendarEvent,
  });

  return response.result;
}

export async function updateCalendarEvent(googleEventId, event, calendarId = 'primary') {
  const calendarEvent = {
    summary: event.title,
    description: event.notes || '',
    start: event.time
      ? { dateTime: `${event.date}T${event.time}:00`, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }
      : { date: event.date },
    end: event.time
      ? { dateTime: `${event.date}T${event.time}:00`, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }
      : { date: event.date },
  };

  if (event.time) {
    const [hours, minutes] = event.time.split(':').map(Number);
    const endHours = hours + 1;
    calendarEvent.end.dateTime = `${event.date}T${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
  }

  const response = await window.gapi.client.calendar.events.update({
    calendarId,
    eventId: googleEventId,
    resource: calendarEvent,
  });

  return response.result;
}

export async function deleteCalendarEvent(googleEventId, calendarId = 'primary') {
  await window.gapi.client.calendar.events.delete({
    calendarId,
    eventId: googleEventId,
  });
}

export async function listCalendarEvents(timeMin, timeMax, calendarId = 'primary') {
  const response = await window.gapi.client.calendar.events.list({
    calendarId,
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 250,
  });

  return (response.result.items || []).map(parseGoogleEvent);
}

function parseGoogleEvent(gEvent) {
  const isAllDay = Boolean(gEvent.start.date);
  const date = isAllDay ? gEvent.start.date : gEvent.start.dateTime.split('T')[0];
  const time = isAllDay ? '' : gEvent.start.dateTime.split('T')[1].substring(0, 5);

  const extProps = gEvent.extendedProperties?.private || {};
  const isFamiliaApp = extProps.familiaApp === 'true';

  return {
    id: gEvent.id,
    googleEventId: gEvent.id,
    title: gEvent.summary || '(Sin título)',
    date,
    time,
    notes: gEvent.description || '',
    members: isFamiliaApp ? JSON.parse(extProps.members || '[]') : [],
    category: isFamiliaApp ? extProps.category || '' : '',
    syncCalendar: true,
    fromGoogle: true,
  };
}
