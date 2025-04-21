import { Link } from 'react-router-dom';
import { User } from '../App';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          LIMS
        </Link>
        <div>
          {user ? (
            <>
              <span className="mr-4">Welcome, User ID: {user.id}</span>
              {user.roles.includes('Admin') && (
                <Link to="/admin" className="mr-4 hover:underline">
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={onLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="mr-4 hover:underline">
                Login
              </Link>
              <Link to="/signup" className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;