const GOOGLE_CALENDAR_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY; // Using existing Maps API key
const CALENDAR_ID = 'primary'; // Replace with your church calendar ID

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  location?: string;
  htmlLink: string;
}

export async function getCalendarEvents(maxResults = 10): Promise<CalendarEvent[]> {
  try {
    const timeMin = new Date().toISOString();
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?key=${GOOGLE_CALENDAR_API_KEY}&timeMin=${timeMin}&maxResults=${maxResults}&singleEvents=true&orderBy=startTime`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch calendar events');
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Calendar API error:', error);
    return [];
  }
}

export function formatEventDate(event: CalendarEvent): string {
  const start = event.start.dateTime || event.start.date;
  if (!start) return '';
  
  const date = new Date(start);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: event.start.dateTime ? 'numeric' : undefined,
    minute: event.start.dateTime ? '2-digit' : undefined,
  });
}