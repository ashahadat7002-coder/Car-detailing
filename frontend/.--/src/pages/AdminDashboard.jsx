import { useState, useEffect } from 'react';
import { getBookings } from '../services/api';

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await getBookings();
        setBookings(response.data.data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="text-white text-center mt-20 text-xl">
        Loading bookings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6 text-blue-500">
        Admin Dashboard
      </h1>

      <div className="overflow-x-auto">
        <table className="w-full text-left bg-gray-800 rounded-lg shadow-lg">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Vehicle</th>
              <th className="p-4">Service</th>
              <th className="p-4">Date & Time</th>
              <th className="p-4">Price</th>
            </tr>
          </thead>

          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="p-6 text-center text-gray-400"
                >
                  No bookings found yet.
                </td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr
                  key={b._id}
                  className="border-b border-gray-700 hover:bg-gray-700"
                >
                  <td className="p-4">{b.customerName}</td>
                  <td className="p-4">{b.phone}</td>
                  <td className="p-4">{b.vehicleType}</td>
                  <td className="p-4">{b.serviceType}</td>

                  <td className="p-4">
                    {new Date(b.bookingDate).toLocaleDateString()}
                    <br />
                    <span className="text-sm text-gray-400">
                      {b.timeSlot}
                    </span>
                  </td>

                  <td className="p-4 text-green-400 font-bold">
                    ₹{b.totalPrice}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;

