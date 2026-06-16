import { useState, FormEvent } from 'react';
import { Event } from '../types';

interface EventFormData {
  title: string;
  description: string;
  date: string;
  capacity: number;
}

interface Props {
  onSubmit: (data: EventFormData) => Promise<void>;
  initialValues?: Partial<EventFormData>;
  submitLabel?: string;
}

export function EventForm({ onSubmit, initialValues, submitLabel = 'Create Event' }: Props) {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [date, setDate] = useState(initialValues?.date ?? '');
  const [capacity, setCapacity] = useState(initialValues?.capacity ?? 10);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSubmit({ title, description, date, capacity: Number(capacity) });
      if (!initialValues) {
        setTitle(''); setDescription(''); setDate(''); setCapacity(10);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const inputCls = 'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <input className={inputCls} placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
      <textarea className={inputCls} placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} rows={3} required />
      <input className={inputCls} type="datetime-local" value={date} onChange={e => setDate(e.target.value)} required />
      <input className={inputCls} type="number" min={1} placeholder="Capacity" value={capacity} onChange={e => setCapacity(Number(e.target.value))} required />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
      >
        {loading ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}
