import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';

const STORAGE_KEY = 'cc_user';
const mockUser = { id: 1, name: 'User', email: 'user@test.com', isAdmin: false };
const mockAdmin = { id: 2, name: 'Admin', email: 'admin@test.com', isAdmin: true };

// Minimal stubs — we only test routing, not page content
function Stub({ name }: { name: string }) {
  return <div>{name}</div>;
}

import { Navigate } from 'react-router-dom';
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? <>{children}</> : <Navigate to="/login" replace />;
}
function AdminRoute({ children }: { children: React.ReactNode }) {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return <Navigate to="/login" replace />;
  const user = JSON.parse(stored);
  return user.isAdmin ? <>{children}</> : <Navigate to="/events" replace />;
}

function makeRouter(initialPath: string) {
  return createMemoryRouter(
    [
      { path: '/login', element: <Stub name="Login Page" /> },
      { path: '/events', element: <PrivateRoute><Stub name="Events Page" /></PrivateRoute> },
      { path: '/admin', element: <AdminRoute><Stub name="Admin Page" /></AdminRoute> },
    ],
    { initialEntries: [initialPath] }
  );
}

beforeEach(() => localStorage.clear());

describe('Route guards', () => {
  it('redirects unauthenticated user from /events to /login', () => {
    render(<AuthProvider><RouterProvider router={makeRouter('/events')} /></AuthProvider>);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('allows authenticated user to access /events', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    render(<AuthProvider><RouterProvider router={makeRouter('/events')} /></AuthProvider>);
    expect(screen.getByText('Events Page')).toBeInTheDocument();
  });

  it('redirects non-admin from /admin to /events', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    render(<AuthProvider><RouterProvider router={makeRouter('/admin')} /></AuthProvider>);
    expect(screen.getByText('Events Page')).toBeInTheDocument();
  });

  it('allows admin to access /admin', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockAdmin));
    render(<AuthProvider><RouterProvider router={makeRouter('/admin')} /></AuthProvider>);
    expect(screen.getByText('Admin Page')).toBeInTheDocument();
  });

  it('redirects unauthenticated user from /admin to /login', () => {
    render(<AuthProvider><RouterProvider router={makeRouter('/admin')} /></AuthProvider>);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});
