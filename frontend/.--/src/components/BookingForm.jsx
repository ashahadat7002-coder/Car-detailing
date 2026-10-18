
import { useState } from 'react';
import {
  createBooking,
  createOrder,
  verifyPayment,
} from '../services/api';

const BookingForm = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    vehicleType: 'Sedan',
    serviceType: 'Exterior Wash & Wax',
    address: {
      street: '',
      area: '',
      pincode: '',
    },
    bookingDate: '',
    timeSlot: '09:00 AM - 11:00 AM',
    totalPrice: 500,
  });

  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  // Calculate service price
  const calculatePrice = (vehicle, service) => {
    const base =
      service === 'Exterior Wash & Wax'
        ? 500
        : service === 'Interior Cleaning'
          ? 800
          : 1500;

    const multiplier =
      vehicle === 'SUV' ? 1.5 :
      vehicle === 'Luxury' ? 2 : 1;

    return base * multiplier;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('address.')) {
      const field = name.split('.')[1];

      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => {
        const newData = {
          ...prev,
          [name]: value,
        };

        if (
          name === 'vehicleType' ||
          name === 'serviceType'
        ) {
          newData.totalPrice = calculatePrice(
            newData.vehicleType,
            newData.serviceType
          );
        }

        return newData;
      });
    }
  };

  // Submit booking and initiate payment
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setStatus('Processing Booking...');

    try {
      // 1. Save booking to MongoDB
      const bookingResponse = await createBooking({
        ...formData,
      });

      const savedBookingId =
        bookingResponse?.data?.data?._id;

      if (!savedBookingId) {
        throw new Error(
          'Backend failed to save booking and return an ID.'
        );
      }

      setStatus('Initiating Payment...');

      // 2. Create Razorpay order
      const orderRes = await createOrder(
        Number(formData.totalPrice),
        savedBookingId
      );

      const order = orderRes.data.order;

      if (!order?.id) {
        throw new Error('Failed to create Razorpay order.');
      }

      // 3. Check Razorpay SDK
      if (!window.Razorpay) {
        throw new Error(
          'Razorpay SDK failed to load. Please refresh the page.'
        );
      }

      // 4. Configure Razorpay checkout
      const options = {
        key: 'rzp_test_TpDiGYAysFzGGU',
        amount: order.amount,
        currency: order.currency,
        name: 'Door 2 Door Detailing',
        description: formData.serviceType,
        order_id: order.id,

        handler: async function (response) {
          setStatus('Verifying Payment...');

          try {
            const verifyRes = await verifyPayment({
              razorpay_order_id:
                response.razorpay_order_id,
              razorpay_payment_id:
                response.razorpay_payment_id,
              razorpay_signature:
                response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              setStatus(
                '✅ Payment Successful & Booking Confirmed!'
              );
            } else {
              setStatus('❌ Payment verification failed.');
            }
          } catch (error) {
            console.error('Verification Error:', error);

            setStatus(
              error.response?.data?.message ||
              '❌ Payment verification failed.'
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setStatus(
              'Payment cancelled. Please try again.'
            );
            setLoading(false);
          },
        },

        theme: {
          color: '#2563eb',
        },
      };

      // 5. Open Razorpay checkout
      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', (response) => {
        console.error('Payment Error:', response.error);

        setStatus('❌ Payment failed. Please try again.');
        setLoading(false);
      });

      rzp.open();
    } catch (error) {
      console.error('Booking Error:', error);

      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message;

      setStatus(`❌ ${errorMsg}`);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-gray-900/80 backdrop-blur-md p-8 rounded-xl shadow-2xl border border-gray-700/50">
      <h2 className="text-3xl font-bold text-blue-500 mb-6 text-center">
        Book Your Detail
      </h2>

      {status && (
        <div
          role="status"
          aria-live="polite"
          className={`mb-4 text-center font-bold p-3 rounded ${
            status.includes('✅')
              ? 'bg-green-900/50 text-green-400'
              : status.includes('❌')
                ? 'bg-red-900/50 text-red-400'
                : 'bg-blue-900/50 text-blue-400'
          }`}
        >
          {status}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            placeholder="Full Name"
            required
            onChange={handleChange}
            className="w-full p-3 bg-gray-700/70 rounded border border-gray-600 focus:border-blue-500 outline-none text-white"
          />

          <input
            type="tel"
            name="phone"
            value={formData.phone}
            placeholder="Phone Number"
            required
            onChange={handleChange}
            className="w-full p-3 bg-gray-700/70 rounded border border-gray-600 focus:border-blue-500 outline-none text-white"
          />
        </div>

        <input
          type="email"
          name="email"
          value={formData.email}
          placeholder="Email Address"
          required
          onChange={handleChange}
          className="w-full p-3 bg-gray-700/70 rounded border border-gray-600 focus:border-blue-500 outline-none text-white"
        />

        {/* Vehicle and service selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            name="vehicleType"
            value={formData.vehicleType}
            onChange={handleChange}
            className="w-full p-3 bg-gray-700/70 rounded border border-gray-600 focus:border-blue-500 outline-none text-white"
          >
            <option value="Hatchback">Hatchback</option>
            <option value="Sedan">Sedan</option>
            <option value="SUV">SUV</option>
            <option value="Luxury">Luxury Car</option>
          </select>

          <select
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            className="w-full p-3 bg-gray-700/70 rounded border border-gray-600 focus:border-blue-500 outline-none text-white"
          >
            <option value="Exterior Wash & Wax">
              Exterior Wash & Wax
            </option>
            <option value="Interior Cleaning">
              Interior Cleaning
            </option>
            <option value="Full Detail">
              Full Detail
            </option>
          </select>
        </div>

        {/* Service address */}
        <h3 className="text-gray-300 font-semibold mt-6 mb-2">
          Service Address
        </h3>

        <input
          type="text"
          name="address.street"
          value={formData.address.street}
          placeholder="Building/Street"
          required
          onChange={handleChange}
          className="w-full p-3 bg-gray-700/70 rounded border border-gray-600 focus:border-blue-500 outline-none text-white"
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="address.area"
            value={formData.address.area}
            placeholder="Area (e.g., Indiranagar)"
            required
            onChange={handleChange}
            className="w-full p-3 bg-gray-700/70 rounded border border-gray-600 focus:border-blue-500 outline-none text-white"
          />

          <input
            type="text"
            name="address.pincode"
            value={formData.address.pincode}
            placeholder="Pincode"
            required
            onChange={handleChange}
            className="w-full p-3 bg-gray-700/70 rounded border border-gray-600 focus:border-blue-500 outline-none text-white"
          />
        </div>

        {/* Booking date and time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <input
            type="date"
            name="bookingDate"
            value={formData.bookingDate}
            required
            onChange={handleChange}
            className="w-full p-3 bg-gray-700/70 rounded border border-gray-600 focus:border-blue-500 outline-none text-white"
          />

          <select
            name="timeSlot"
            value={formData.timeSlot}
            onChange={handleChange}
            className="w-full p-3 bg-gray-700/70 rounded border border-gray-600 focus:border-blue-500 outline-none text-white"
          >
            <option value="09:00 AM - 11:00 AM">
              09:00 AM - 11:00 AM
            </option>
            <option value="11:00 AM - 01:00 PM">
              11:00 AM - 01:00 PM
            </option>
            <option value="02:00 PM - 04:00 PM">
              02:00 PM - 04:00 PM
            </option>
            <option value="04:00 PM - 06:00 PM">
              04:00 PM - 06:00 PM
            </option>
          </select>
        </div>

        {/* Total and submit */}
        <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-600">
          <div className="text-2xl font-bold text-green-400">
            Total: ₹{formData.totalPrice}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white font-bold py-3 px-8 rounded transition shadow-lg"
          >
            {loading ? 'Processing...' : 'Pay & Confirm'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;












