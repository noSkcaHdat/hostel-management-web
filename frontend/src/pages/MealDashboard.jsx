import { useState, useEffect } from 'react';
import { mealAPI } from '../lib/api';
import { Calendar, UtensilsCrossed, Coffee, Sun, Moon, Clock } from 'lucide-react';

export default function MealDashboard() {
  const [menu, setMenu] = useState({});
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [bookingData, setBookingData] = useState({
    breakfast: false,
    lunch: false,
    dinner: false,
  });

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const mealTypes = ['breakfast', 'lunch', 'dinner'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [menuRes, bookingsRes] = await Promise.all([
        mealAPI.getMenu(),
        mealAPI.getMyBookings(),
      ]);
      setMenu(menuRes.data);
      setBookings(bookingsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedDate) {
      alert('Please select a date');
      return;
    }

    try {
      await mealAPI.createBooking({
        date: selectedDate,
        ...bookingData,
      });
      setSelectedDate('');
      setBookingData({ breakfast: false, lunch: false, dinner: false });
      fetchData();
      alert('Meal booked successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to book meal');
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await mealAPI.cancelBooking(id);
      fetchData();
      alert('Booking cancelled successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel booking');
    }
  };

  const getBookingForDate = (date) => {
    return bookings.find(b => {
      const bookingDate = new Date(b.date).toISOString().split('T')[0];
      return bookingDate === date;
    });
  };

  const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getDateString = (daysFromToday) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromToday);
    return date.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Meal Booking</h1>
        <p className="text-gray-600 mt-1">Book your meals and view weekly menu</p>
      </div>

      {/* Weekly Menu */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
          <UtensilsCrossed className="w-5 h-5" />
          <span>Weekly Menu</span>
        </h2>
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

      {/* Book Meal */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Book a Meal</h2>
        <form onSubmit={handleBooking} className="space-y-4">
          <div>
            <label className="label">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={getTodayDateString()}
              className="input-field"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="label">Select Meals</label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bookingData.breakfast}
                  onChange={(e) => setBookingData({ ...bookingData, breakfast: e.target.checked })}
                  className="w-4 h-4 text-primary-600"
                />
                <Coffee className="w-4 h-4 text-yellow-600" />
                <span>Breakfast</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bookingData.lunch}
                  onChange={(e) => setBookingData({ ...bookingData, lunch: e.target.checked })}
                  className="w-4 h-4 text-primary-600"
                />
                <Sun className="w-4 h-4 text-orange-600" />
                <span>Lunch</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bookingData.dinner}
                  onChange={(e) => setBookingData({ ...bookingData, dinner: e.target.checked })}
                  className="w-4 h-4 text-primary-600"
                />
                <Moon className="w-4 h-4 text-blue-600" />
                <span>Dinner</span>
              </label>
            </div>
          </div>

          <button type="submit" className="btn-primary">
            Book Meals
          </button>
        </form>
      </div>

      {/* My Bookings */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">My Bookings</h2>
        {bookings.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No bookings yet</p>
        ) : (
          <div className="space-y-3">
            {bookings.map(booking => {
              const bookingDate = new Date(booking.date);
              const isPast = bookingDate < new Date();
              bookingDate.setHours(0, 0, 0, 0);

              return (
                <div key={booking.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">
                        {bookingDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
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
                    {!isPast && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}