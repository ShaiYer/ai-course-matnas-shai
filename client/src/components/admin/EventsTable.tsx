import { useState } from 'react';
import { Event } from '../../types';
import { EventForm } from '../EventForm';

interface EventFormData {
  title: string;
  description: string;
  date: string;
  capacity: number;
}

interface Props {
  events: Event[];
  onCreate?: (data: EventFormData) => Promise<void>;
  onUpdate: (id: number, data: EventFormData) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  emptyMessage?: string;
}

export function EventsTable({ events, onCreate, onUpdate, onDelete, emptyMessage = 'No events yet.' }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);

  async function handleUpdate(id: number, data: EventFormData) {
    await onUpdate(id, data);
    setEditingId(null);
  }

  return (
    <div className="flex flex-col gap-6">
      {onCreate && (
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <h3 className="text-base font-semibold text-gray-700 mb-4">New Event</h3>
          <EventForm onSubmit={onCreate} />
        </div>
      )}

      {events.length === 0 && (
        <p className="text-gray-500 text-sm">{emptyMessage}</p>
      )}

      {events.map(event => (
        <div key={event.id} className="bg-white rounded-xl shadow p-5 border border-gray-100">
          {editingId === event.id ? (
            <>
              <p className="text-sm font-medium text-gray-600 mb-3">Editing: {event.title}</p>
              <EventForm
                initialValues={{
                  title: event.title,
                  description: event.description,
                  date: new Date(event.date).toISOString().slice(0, 16),
                  capacity: event.capacity,
                }}
                onSubmit={data => handleUpdate(event.id, data)}
                submitLabel="Save Changes"
              />
              <button
                onClick={() => setEditingId(null)}
                className="mt-2 text-sm text-gray-500 hover:underline"
              >
                Cancel
              </button>
            </>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-gray-800">{event.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(event.date).toLocaleString()} · Capacity: {event.capacity} · Registered: {event._count?.registrations ?? 0}
                </p>
                <p className="text-sm text-gray-500 mt-1 line-clamp-1">{event.description}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setEditingId(event.id)}
                  className="text-sm px-3 py-1 rounded border border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(event.id)}
                  className="text-sm px-3 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
