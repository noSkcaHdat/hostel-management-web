import { useState, useEffect } from 'react';
import { mealAPI } from '../lib/api';
import { 
  UtensilsCrossed, 
  Calendar, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Coffee, 
  Sun, 
  Moon,
  User,
  Plus,
  Edit,
  BarChart3
} from 'lucide-react';

export default function MealManagement() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [menu, setMenu] = useState({});
  const [loading, setLoading] = useState(true);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [menuForm, setMenuForm] = useState({
    day: '',
    meal_type: '',
    menu_items: '',
  });

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const mealTypes = ['breakfast', 'lunch', 'dinner'];

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [menuRes, bookingsRes, statsRes] = await Promise.all([
        mealAPI.getMenu(),
        mealAPI.getBookingsByDate(selectedDate),
        mealAPI.getStats(),
      ]);
      setMenu(menuRes.data || {});
      setBookings(bookingsRes.data || []);
      // Ensure stats has all required properties
      const statsData = statsRes.data || {};
      setStats({
        totalStudents: statsData.totalStudents || 0,
        today: statsData.today || {
          totalBookings: 0,
          uniqueStudents: 0,
          breakfast: 0,
          lunch: 0,
          dinner: 0,
          studentsNotBooked: 0,
          bookingPercentage: 0,
        },
        yesterday: statsData.yesterday || {
          totalBookings: 0,
          uniqueStudents: 0,
          breakfast: 0,
          lunch: 0,
          dinner: 0,
        },
        comparison: statsData.comparison || {
          bookingChange: 0,
          studentChange: 0,
          breakfastChange: 0,
          lunchChange: 0,
          dinnerChange: 0,
        },
      });
    } catch (err) {
      console.error('Error fetching data:', err);
      // Set default values on error
      setStats({
        totalStudents: 0,
        today: {
          totalBookings: 0,
          uniqueStudents: 0,
          breakfast: 0,
          lunch: 0,
          dinner: 0,
          studentsNotBooked: 0,
          bookingPercentage: 0,
        },
        yesterday: {
          totalBookings: 0,
          uniqueStudents: 0,
          breakfast: 0,
          lunch: 0,
          dinner: 0,
        },
        comparison: {
          bookingChange: 0,
          studentChange: 0,
          breakfastChange: 0,
          lunchChange: 0,
          dinnerChange: 0,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    try {
      await mealAPI.createMenu(menuForm);
      setMenuForm({ day: '', meal_type: '', menu_items: '' });
      setShowMenuForm(false);
      fetchData();
      alert('Menu updated successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update menu');
    }
  };

  const getComparisonIcon = (value) => {
    if (value > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (value < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <span className="text-gray-400">—</span>;
  };

  const getComparisonColor = (value) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Meal Management</h1>
        <p className="text-gray-600 mt-1">Manage meal bookings and weekly menu</p>
      </div>

      {/* Statistics Dashboard */}
      {stats && stats.today && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Students */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalStudents || 0}</p>
              </div>
              <Users className="w-8 h-8 text-primary-600" />
            </div>
          </div>

          {/* Today's Bookings */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Bookings</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.today.totalBookings || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.today.uniqueStudents || 0} students ({stats.today.bookingPercentage || 0}%)
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-600" />
            </div>
          </div>

          {/* Students Not Booked */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Not Booked Today</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.today.studentsNotBooked || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {(stats.totalStudents || 0) - (stats.today.uniqueStudents || 0)} students
                </p>
              </div>
              <Users className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          {/* Booking Change */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">vs Yesterday</p>
                <div className="flex items-center space-x-2 mt-1">
                  {stats.comparison ? getComparisonIcon(stats.comparison.bookingChange) : <span className="text-gray-400">—</span>}
                  <p className={`text-2xl font-bold ${stats.comparison ? getComparisonColor(stats.comparison.bookingChange) : 'text-gray-600'}`}>
                    {stats.comparison ? (stats.comparison.bookingChange > 0 ? '+' : '') + stats.comparison.bookingChange : '0'}
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-1">bookings</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>
      )}

      {/* Comparison Section */}
      {stats && stats.today && stats.yesterday && stats.comparison && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Today vs Yesterday Comparison</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Coffee className="w-4 h-4 text-yellow-600" />
                <span className="font-medium">Breakfast</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Today: {stats.today.breakfast || 0}</span>
                <div className="flex items-center space-x-1">
                  {getComparisonIcon(stats.comparison.breakfastChange)}
                  <span className={`text-sm font-semibold ${getComparisonColor(stats.comparison.breakfastChange)}`}>
                    {stats.comparison.breakfastChange > 0 ? '+' : ''}{stats.comparison.breakfastChange}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Yesterday: {stats.yesterday.breakfast || 0}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Sun className="w-4 h-4 text-orange-600" />
                <span className="font-medium">Lunch</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Today: {stats.today.lunch || 0}</span>
                <div className="flex items-center space-x-1">
                  {getComparisonIcon(stats.comparison.lunchChange)}
                  <span className={`text-sm font-semibold ${getComparisonColor(stats.comparison.lunchChange)}`}>
                    {stats.comparison.lunchChange > 0 ? '+' : ''}{stats.comparison.lunchChange}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Yesterday: {stats.yesterday.lunch || 0}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Moon className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Dinner</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Today: {stats.today.dinner || 0}</span>
                <div className="flex items-center space-x-1">
                  {getComparisonIcon(stats.comparison.dinnerChange)}
                  <span className={`text-sm font-semibold ${getComparisonColor(stats.comparison.dinnerChange)}`}>
                    {stats.comparison.dinnerChange > 0 ? '+' : ''}{stats.comparison.dinnerChange}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Yesterday: {stats.yesterday.dinner || 0}</p>
            </div>
          </div>

          {/* Student Comparison */}
          <div className="mt-4 p-4 bg-primary-50 rounded-lg border border-primary-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-primary-900">Students Booked</p>
                <p className="text-sm text-primary-700">
                  Today: {stats.today.uniqueStudents || 0} / {stats.totalStudents || 0} ({stats.today.bookingPercentage || 0}%)
                </p>
                <p className="text-sm text-primary-600">
                  Yesterday: {stats.yesterday.uniqueStudents || 0} / {stats.totalStudents || 0}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {getComparisonIcon(stats.comparison.studentChange)}
                <span className={`text-lg font-bold ${getComparisonColor(stats.comparison.studentChange)}`}>
                  {stats.comparison.studentChange > 0 ? '+' : ''}{stats.comparison.studentChange}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Bookings by Date */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Bookings by Date</span>
          </h2>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input-field w-auto"
          />
        </div>

        {bookings.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No bookings for this date</p>
        ) : (
          <div className="space-y-3">
            {bookings.map(booking => (
              <div key={booking.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {booking.profiles?.email || 'Unknown Student'}
                      </p>
                      <p className="text-xs text-gray-500">ID: {booking.student_id.slice(0, 8)}...</p>
                      <div className="flex items-center space-x-4 mt-2">
                        {booking.breakfast && (
                          <span className="flex items-center space-x-1 text-sm">
                            <Coffee className="w-4 h-4 text-yellow-600" />
                            <span>Breakfast</span>
                          </span>
                        )}
                        {booking.lunch && (
                          <span className="flex items-center space-x-1 text-sm">
                            <Sun className="w-4 h-4 text-orange-600" />
                            <span>Lunch</span>
                          </span>
                        )}
                        {booking.dinner && (
                          <span className="flex items-center space-x-1 text-sm">
                            <Moon className="w-4 h-4 text-blue-600" />
                            <span>Dinner</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      Booked: {new Date(booking.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Menu Management */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center space-x-2">
            <UtensilsCrossed className="w-5 h-5" />
            <span>Weekly Menu</span>
          </h2>
          <button
            onClick={() => setShowMenuForm(!showMenuForm)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add/Update Menu</span>
          </button>
        </div>

        {showMenuForm && (
          <form onSubmit={handleMenuSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Day</label>
                <select
                  value={menuForm.day}
                  onChange={(e) => setMenuForm({ ...menuForm, day: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select day</option>
                  {days.map(day => (
                    <option key={day} value={day}>{day.charAt(0).toUpperCase() + day.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Meal Type</label>
                <select
                  value={menuForm.meal_type}
                  onChange={(e) => setMenuForm({ ...menuForm, meal_type: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select meal</option>
                  {mealTypes.map(type => (
                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Menu Items</label>
                <input
                  type="text"
                  value={menuForm.menu_items}
                  onChange={(e) => setMenuForm({ ...menuForm, menu_items: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Rice, Dal, Curry"
                  required
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button type="submit" className="btn-primary">Save Menu</button>
              <button
                type="button"
                onClick={() => {
                  setShowMenuForm(false);
                  setMenuForm({ day: '', meal_type: '', menu_items: '' });
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {days.map(day => (
            <div key={day} className="border rounded-lg p-3">
              <h3 className="font-semibold text-sm mb-2 capitalize">{day}</h3>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-medium">Breakfast:</span>
                  <p className="text-gray-600">{menu[day]?.breakfast || 'Not set'}</p>
                </div>
                <div>
                  <span className="font-medium">Lunch:</span>
                  <p className="text-gray-600">{menu[day]?.lunch || 'Not set'}</p>
                </div>
                <div>
                  <span className="font-medium">Dinner:</span>
                  <p className="text-gray-600">{menu[day]?.dinner || 'Not set'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

