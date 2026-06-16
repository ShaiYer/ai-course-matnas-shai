import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Event, User, UserRole } from '../types';
import { EventsTable } from '../components/admin/EventsTable';
import { EventsReadOnlyList } from '../components/admin/EventsReadOnlyList';
import { UsersTable } from '../components/admin/UsersTable';

type Tab = 'events' | 'upcoming' | 'past' | 'users';

interface EventFormData {
  title: string;
  description: string;
  date: string;
  capacity: number;
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
        active
          ? 'border-blue-600 text-blue-600 bg-white'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {label}
    </button>
  );
}

export function AdminPage() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  const [tab, setTab] = useState<Tab>('events');
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');

  async function loadEvents() {
    try {
      setEvents(await api.get<Event[]>('/api/events'));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    }
  }

  async function loadUsers() {
    try {
      setUsers(await api.get<User[]>('/api/users'));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    }
  }

  useEffect(() => {
    loadEvents();
    if (isAdmin) loadUsers();
  }, [isAdmin]);

  async function handleCreate(data: EventFormData) {
    await api.post('/api/events', data);
    await loadEvents();
  }

  async function handleUpdate(id: number, data: EventFormData) {
    await api.put(`/api/events/${id}`, data);
    await loadEvents();
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this event and all registrations?')) return;
    await api.delete(`/api/events/${id}`);
    await loadEvents();
  }

  async function handleRoleChange(userId: number, role: UserRole) {
    try {
      await api.put(`/api/users/${userId}/role`, { role });
      await loadUsers();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update role');
    }
  }

  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.date) >= now);
  const pastEvents = events.filter(e => new Date(e.date) < now);

  const tabs: { id: Tab; label: string; adminOnly?: boolean }[] = [
    { id: 'events', label: 'Events Manager' },
    { id: 'upcoming', label: `Upcoming (${upcomingEvents.length})` },
    { id: 'past', label: `Past (${pastEvents.length})` },
    { id: 'users', label: 'Users', adminOnly: true },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {tabs
          .filter(t => !t.adminOnly || isAdmin)
          .map(t => (
            <TabButton
              key={t.id}
              label={t.label}
              active={tab === t.id}
              onClick={() => setTab(t.id)}
            />
          ))}
      </div>

      {/* Tab content */}
      {tab === 'events' && (
        <EventsTable
          events={events}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          emptyMessage="No events yet. Use the form above to create one."
        />
      )}

      {tab === 'upcoming' && (
        <EventsReadOnlyList
          events={upcomingEvents}
          emptyMessage="No upcoming events."
        />
      )}

      {tab === 'past' && (
        <EventsReadOnlyList
          events={pastEvents}
          emptyMessage="No past events."
        />
      )}

      {tab === 'users' && isAdmin && (
        <UsersTable
          users={users}
          currentUserId={currentUser!.id}
          onRoleChange={handleRoleChange}
        />
      )}
    </div>
  );
}
