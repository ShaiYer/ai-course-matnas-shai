import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Event, Registration } from '../types';
import { EventCard } from '../components/EventCard';

export function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<Registration[]>([]);
  const [error, setError] = useState('');

  async function load() {
    try {
      const [evts, regs] = await Promise.all([
        api.get<Event[]>('/api/events'),
        api.get<Registration[]>('/api/registrations/my'),
      ]);
      setEvents(evts);
      setMyRegistrations(regs);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    }
  }

  useEffect(() => { load(); }, []);

  async function handleRegister(eventId: number) {
    try {
      await api.post('/api/registrations', { eventId });
      await load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to register');
    }
  }

  async function handleCancel(eventId: number) {
    try {
      await api.delete(`/api/registrations/${eventId}`);
      await load();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to cancel');
    }
  }

  const registeredEventIds = new Set(myRegistrations.map(r => r.eventId));

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Upcoming Events</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {events.length === 0 && !error && (
        <p className="text-gray-500 text-sm">No events yet. Check back soon!</p>
      )}
      <div className="flex flex-col gap-4">
        {events.map(event => (
          <EventCard
            key={event.id}
            event={event}
            isRegistered={registeredEventIds.has(event.id)}
            onRegister={() => handleRegister(event.id)}
            onCancel={() => handleCancel(event.id)}
          />
        ))}
      </div>
    </div>
  );
}
