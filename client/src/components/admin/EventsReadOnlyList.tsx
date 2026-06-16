import { Event } from '../../types';

interface Props {
  events: Event[];
  emptyMessage?: string;
}

export function EventsReadOnlyList({ events, emptyMessage = 'No events.' }: Props) {
  if (events.length === 0) {
    return <p className="text-gray-500 text-sm">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {events.map(event => (
        <div key={event.id} className="bg-white rounded-xl shadow p-5 border border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-gray-800">{event.title}</p>
              <p className="text-sm text-gray-500 mt-0.5">{event.description}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(event.date).toLocaleString()} · Capacity: {event.capacity} · Registered: {event._count?.registrations ?? 0}
              </p>
            </div>
            <span className={`shrink-0 text-xs px-2 py-1 rounded-full font-medium ${
              (event._count?.registrations ?? 0) >= event.capacity
                ? 'bg-red-100 text-red-600'
                : 'bg-green-100 text-green-700'
            }`}>
              {(event._count?.registrations ?? 0) >= event.capacity
                ? 'Full'
                : `${event.capacity - (event._count?.registrations ?? 0)} spots left`}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
