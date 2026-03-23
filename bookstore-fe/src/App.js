import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BookDetails from './pages/BookDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import AdminDashboard from './pages/AdminDashboard';
import AdminAddBook from './pages/AdminAddBook';
import AdminAddCategory from './pages/AdminAddCategory';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col pt-16">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/books/:id" element={<BookDetails />} />

              <Route path="/cart" element={
                <PrivateRoute>
                  <Cart />
                </PrivateRoute>
              } />

              <Route path="/checkout" element={
                <PrivateRoute>
                  <Checkout />
                </PrivateRoute>
              } />

              <Route path="/profile" element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } />

              <Route path="/orders" element={
                <PrivateRoute>
                  <Orders />
                </PrivateRoute>
              } />

              <Route path="/admin" element={
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
              } />

              <Route path="/admin/add-book" element={
                <PrivateRoute>
                  <AdminAddBook />
                </PrivateRoute>
              } />

              <Route path="/admin/add-category" element={
                <PrivateRoute>
                  <AdminAddCategory />
                </PrivateRoute>
              } />
            </Routes>
          </main>
          <footer className="bg-gray-800 text-white text-center py-6 mt-12">
            <p>&copy; {new Date().getFullYear()} Modern Bookstore Microservices.</p>
            <p className="mt-2 flex justify-center space-x-4 text-xs">
              <span className="text-gray-400 font-mono">auth</span>
              <span className="text-gray-400 font-mono">catalog</span>
              <span className="text-gray-400 font-mono">customer</span>
              <span className="text-gray-400 font-mono">order</span>
              <span className="text-gray-400 font-mono">payment</span>
              <span className="text-gray-400 font-mono">ship</span>
              <span className="text-gray-400 font-mono">manager</span>
              <span className="text-gray-400 font-mono">staff</span>
              <span className="text-gray-400 font-mono">comment-rate</span>
              <span className="text-gray-400 font-mono">recommender-ai</span>
            </p>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
