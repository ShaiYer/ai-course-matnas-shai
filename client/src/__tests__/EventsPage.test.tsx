import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { AuthProvider } from '../context/AuthContext';
import { EventsPage } from '../pages/EventsPage';
import { server } from '../test/setup';
import { mockUser, mockEvent } from '../test/handlers';

const STORAGE_KEY = 'cc_user';

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
});

function renderEventsPage() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/events']}>
        <Routes>
          <Route path="/events" element={<EventsPage />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

describe('EventsPage', () => {
  it('renders event titles from API', async () => {
    renderEventsPage();
    await waitFor(() => expect(screen.getByText('Test Event')).toBeInTheDocument());
  });

  it('shows Register button when user is not registered', async () => {
    server.use(http.get('http://localhost:3001/api/registrations/my', () => HttpResponse.json([])));
    renderEventsPage();
    await waitFor(() => expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument());
  });

  it('shows Cancel Registration button when user is already registered', async () => {
    renderEventsPage();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /cancel registration/i })).toBeInTheDocument()
    );
  });

  it('shows disabled Event Full button when event is at capacity', async () => {
    const fullEvent = { ...mockEvent, capacity: 2, _count: { registrations: 2 } };
    server.use(
      http.get('http://localhost:3001/api/events', () => HttpResponse.json([fullEvent])),
      http.get('http://localhost:3001/api/registrations/my', () => HttpResponse.json([]))
    );
    renderEventsPage();
    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /event full/i });
      expect(btn).toBeDisabled();
    });
  });

  it('clicking Register calls the registrations API', async () => {
    let called = false;
    server.use(
      http.get('http://localhost:3001/api/registrations/my', () => HttpResponse.json([])),
      http.post('http://localhost:3001/api/registrations', () => {
        called = true;
        return HttpResponse.json({ id: 2, userId: 1, eventId: 1, registeredAt: new Date().toISOString() }, { status: 201 });
      })
    );
    renderEventsPage();
    await waitFor(() => screen.getByRole('button', { name: /^register$/i }));
    await userEvent.click(screen.getByRole('button', { name: /^register$/i }));
    await waitFor(() => expect(called).toBe(true));
  });
});
