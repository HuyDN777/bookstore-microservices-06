import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
    const { isAuthenticated, logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="fixed top-0 w-full bg-white shadow-md z-50">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link to="/" className="flex items-center space-x-2 text-blue-600 font-bold text-xl hover:text-blue-800 transition">
                    <BookOpen />
                    <span>MicroStore</span>
                </Link>

                <div className="flex items-center space-x-6">
                    <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium">Browse</Link>

                    {isAuthenticated ? (
                        <>
                            <Link to="/admin" className="text-gray-600 hover:text-blue-600 font-medium mr-4">Dashboard</Link>
                            <Link to="/cart" className="text-gray-600 hover:text-blue-600 relative flex items-center mr-4">
                                <ShoppingCart className="w-5 h-5 mr-1" />
                                <span>Cart</span>
                            </Link>
                            <Link to="/orders" className="text-gray-600 hover:text-blue-600 font-medium mr-4">Orders</Link>
                            <div className="flex items-center text-gray-800 border-l border-gray-300 pl-4 space-x-4">
                                <Link to="/profile" className="flex items-center text-sm font-medium hover:text-blue-600 transition">
                                    <User className="w-4 h-4 mr-1" /> Profile
                                </Link>
                                <button onClick={handleLogout} className="text-red-500 hover:text-red-700 font-medium flex items-center text-sm transition">
                                    <LogOut className="w-4 h-4 mr-1" /> Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex space-x-4 border-l border-gray-300 pl-4">
                            <Link to="/login" className="text-blue-600 font-medium hover:text-blue-800">Login</Link>
                            <Link to="/register" className="bg-blue-600 text-white px-4 py-1 rounded shadow hover:bg-blue-700 transition">Register</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
