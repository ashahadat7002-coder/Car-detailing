import axios from 'axios';

const API = axios.create({
  // Replace this with your actual Render backend URL
  baseURL: 'https://door2door-backend-0otw.onrender.com/api',
});

// Create a new booking
export const createBooking = (bookingData) =>
  API.post('/bookings', bookingData);

// Get all bookings
export const getBookings = () =>
  API.get('/bookings');

// Create Razorpay payment order
export const createOrder = (amount, bookingId) =>
  API.post('/payments/create-order', {
    amount,
    bookingId,
  });

// Verify Razorpay payment
export const verifyPayment = (paymentData) =>
  API.post('/payments/verify-payment', paymentData);

export default API;
