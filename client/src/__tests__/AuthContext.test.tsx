import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';

const STORAGE_KEY = 'cc_user';
const mockUser = { id: 1, name: 'Alice', email: 'alice@test.com', isAdmin: false, role: 'user' as const };

function TestConsumer() {
  const { currentUser, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="user">{currentUser ? currentUser.name : 'none'}</span>
      <button onClick={() => login(mockUser)}>login</button>
      <button onClick={logout}>logout</button>
    </div>
  );
}

beforeEach(() => localStorage.clear());

describe('AuthContext', () => {
  it('starts with no user when localStorage is empty', () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    expect(screen.getByTestId('user').textContent).toBe('none');
  });

  it('hydrates from localStorage on mount', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    expect(screen.getByTestId('user').textContent).toBe('Alice');
  });

  it('login sets user in state and localStorage', () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    act(() => screen.getByText('login').click());
    expect(screen.getByTestId('user').textContent).toBe('Alice');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).name).toBe('Alice');
  });

  it('logout clears user from state and localStorage', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    act(() => screen.getByText('logout').click());
    expect(screen.getByTestId('user').textContent).toBe('none');
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('useAuth throws when used outside AuthProvider', () => {
    const consoleError = console.error;
    console.error = () => {};
    expect(() => render(<TestConsumer />)).toThrow();
    console.error = consoleError;
  });
});
