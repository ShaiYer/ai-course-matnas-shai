import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { AuthProvider } from '../context/AuthContext';
import { AdminPage } from '../pages/AdminPage';
import { server } from '../test/setup';
import { mockAdmin, mockEvent } from '../test/handlers';

const STORAGE_KEY = 'cc_user';

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockAdmin));
});

function renderAdminPage() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

describe('AdminPage', () => {
  it('renders the create event form', async () => {
    renderAdminPage();
    await waitFor(() => expect(screen.getByPlaceholderText('Title')).toBeInTheDocument());
    expect(screen.getByText('New Event')).toBeInTheDocument();
  });

  it('renders existing events in the list', async () => {
    renderAdminPage();
    await waitFor(() => expect(screen.getByText('Test Event')).toBeInTheDocument());
  });

  it('submitting the create form calls POST /api/events', async () => {
    let called = false;
    server.use(
      http.post('http://localhost:3001/api/events', () => {
        called = true;
        return HttpResponse.json(mockEvent, { status: 201 });
      })
    );
    renderAdminPage();
    await waitFor(() => screen.getByPlaceholderText('Title'));
    await userEvent.type(screen.getByPlaceholderText('Title'), 'New Event');
    await userEvent.type(screen.getByPlaceholderText('Description'), 'Desc');
    await userEvent.type(screen.getByPlaceholderText('Capacity'), '5');
    // date input
    const dateInput = screen.getByDisplayValue('');
    await userEvent.type(dateInput, '2027-06-01T10:00');
    await userEvent.click(screen.getByRole('button', { name: /create event/i }));
    await waitFor(() => expect(called).toBe(true));
  });

  it('clicking Edit shows pre-filled form', async () => {
    renderAdminPage();
    await waitFor(() => screen.getByRole('button', { name: /edit/i }));
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Event')).toBeInTheDocument();
    });
  });

  it('clicking Delete triggers DELETE API call', async () => {
    let deleted = false;
    server.use(
      http.delete('http://localhost:3001/api/events/:id', () => {
        deleted = true;
        return HttpResponse.json({ success: true });
      })
    );
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    renderAdminPage();
    await waitFor(() => screen.getByRole('button', { name: /delete/i }));
    await userEvent.click(screen.getByRole('button', { name: /delete/i }));
    await waitFor(() => expect(deleted).toBe(true));
    confirmSpy.mockRestore();
  });
});
