import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Create a new booking
export const createBooking = (bookingData) =>
  API.post('/bookings', bookingData);

// Get all bookings
export const getBookings = () =>
  API.get('/bookings');

// Create Razorpay order with booking ID
export const createOrder = (amount, bookingId) =>
  API.post('/payments/create-order', {
    amount,
    bookingId,
  });

// Verify Razorpay payment
export const verifyPayment = (paymentData) =>
  API.post('/payments/verify-payment', paymentData);
