import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, Shield, QrCode, UtensilsCrossed } from 'lucide-react';

export default function Layout({ children }) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Hostel ManagementOps Portal</span>
              </Link>

              <nav className="hidden md:flex space-x-4">
                {profile?.role === 'student' && (
                  <>
                    <Link
                      to="/student"
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive('/student') || isActive('/')
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      My Leaves
                    </Link>
                    <Link
                      to="/meals"
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive('/meals')
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <UtensilsCrossed className="w-4 h-4 inline mr-2" />
                      Meal Booking
                    </Link>
                  </>
                )}

                {profile?.role === 'warden' && (
                  <>
                    <Link
                      to="/warden"
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive('/warden') || isActive('/')
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Pending Leaves
                    </Link>
                    <Link
                      to="/gatepass"
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive('/gatepass')
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <QrCode className="w-4 h-4 inline mr-2" />
                      Verify Gate Pass
                    </Link>
                    <Link
                      to="/meals/management"
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive('/meals/management')
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <UtensilsCrossed className="w-4 h-4 inline mr-2" />
                      Meal Management
                    </Link>
                  </>
                )}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="w-4 h-4" />
                <span className="capitalize">{profile?.role || 'User'}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

