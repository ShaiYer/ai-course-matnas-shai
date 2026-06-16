import { Event } from '../types';
import { RegistrationButton } from './RegistrationButton';

interface Props {
  event: Event;
  isRegistered: boolean;
  onRegister: () => void;
  onCancel: () => void;
}

export function EventCard({ event, isRegistered, onRegister, onCancel }: Props) {
  const registered = event._count?.registrations ?? 0;
  const isFull = registered >= event.capacity;

  return (
    <div className="bg-white rounded-xl shadow p-5 flex flex-col gap-3 border border-gray-100">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-lg font-semibold text-gray-800">{event.title}</h2>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${isFull ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
          {isFull ? 'Full' : `${event.capacity - registered} spots left`}
        </span>
      </div>
      <p className="text-sm text-gray-600">{event.description}</p>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-gray-400">
          {new Date(event.date).toLocaleString()} · {registered}/{event.capacity} registered
        </span>
        <RegistrationButton
          isRegistered={isRegistered}
          isFull={isFull}
          onRegister={onRegister}
          onCancel={onCancel}
        />
      </div>
    </div>
  );
}
