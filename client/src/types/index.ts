export type UserRole = 'user' | 'manager' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
  role: UserRole;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  capacity: number;
  createdAt: string;
  _count?: { registrations: number };
}

export interface Registration {
  id: number;
  userId: number;
  eventId: number;
  registeredAt: string;
  event?: Event;
}
