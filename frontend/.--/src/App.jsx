import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import BookingForm from './components/BookingForm';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      {/* Main Container */}
      <div className="min-h-screen text-white">

        {/* Navigation Bar with Glass Effect */}
        <nav className="bg-gray-900/80 backdrop-blur-md p-4 shadow-lg flex justify-center space-x-8 sticky top-0 z-50 border-b border-gray-700/50">
          <Link
            to="/"
            className="text-blue-400 hover:text-white font-bold transition"
          >
            Book a Service
          </Link>

          <Link
            to="/admin"
            className="text-blue-400 hover:text-white font-bold transition"
          >
            Admin Dashboard
          </Link>
        </nav>

        {/* Main Content Area */}
        <div className="py-12 px-4">

          {/* Website Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 mb-2 drop-shadow-lg">
              Door 2 Door
            </h1>

            <p className="text-gray-300 font-medium drop-shadow-md">
              Premium Car Detailing Services
            </p>
          </div>

          {/* Page Routes */}
          <Routes>
            <Route path="/" element={<BookingForm />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>

        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
