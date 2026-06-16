import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="bg-blue-700 text-white px-6 py-3 flex items-center justify-between shadow">
      <Link to="/events" className="text-xl font-bold tracking-tight">
        🏛 Community Center
      </Link>
      <div className="flex items-center gap-4">
        {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && (
          <Link to="/admin" className="text-sm hover:underline">
            {currentUser.role === 'admin' ? 'Admin Dashboard' : 'Events Manager'}
          </Link>
        )}
        {currentUser && (
          <>
            <span className="text-sm opacity-80">Hi, {currentUser.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm bg-blue-500 hover:bg-blue-400 px-3 py-1 rounded"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
