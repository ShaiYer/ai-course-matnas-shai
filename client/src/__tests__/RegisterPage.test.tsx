import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { AuthProvider } from '../context/AuthContext';
import { RegisterPage } from '../pages/RegisterPage';
import { server } from '../test/setup';

beforeEach(() => localStorage.clear());

function renderRegister() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/events" element={<div>Events Page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
}

describe('RegisterPage', () => {
  it('renders name, email and password inputs', () => {
    renderRegister();
    expect(screen.getByPlaceholderText('Full Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('redirects to /events on successful registration', async () => {
    renderRegister();
    await userEvent.type(screen.getByPlaceholderText('Full Name'), 'Alice');
    await userEvent.type(screen.getByPlaceholderText('Email'), 'alice@test.com');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'pass');
    await userEvent.click(screen.getByRole('button', { name: /register/i }));
    await waitFor(() => expect(screen.getByText('Events Page')).toBeInTheDocument());
  });

  it('shows error on duplicate email', async () => {
    server.use(
      http.post('http://localhost:3001/api/users/register', () =>
        HttpResponse.json({ error: 'Email already in use' }, { status: 409 })
      )
    );
    renderRegister();
    await userEvent.type(screen.getByPlaceholderText('Full Name'), 'Alice');
    await userEvent.type(screen.getByPlaceholderText('Email'), 'taken@test.com');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'pass');
    await userEvent.click(screen.getByRole('button', { name: /register/i }));
    await waitFor(() => expect(screen.getByText(/email already in use/i)).toBeInTheDocument());
  });
});
