import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingCart } from 'lucide-react';
import api from '../services/api';

function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const res = await api.get('/carts/');
            if (res.data && res.data.length > 0) {
                // Assume first cart is user's active cart
                const cartId = res.data[0].id;
                const itemsRes = await api.get(`/carts/items/?cart=${cartId}`);

                // We need to fetch book details for each item to show title & price
                const itemsWithDetails = await Promise.all(
                    itemsRes.data.map(async (item) => {
                        try {
                            const bookRes = await api.get(`/books/${item.book_id}/`);
                            return { ...item, book: bookRes.data };
                        } catch (e) {
                            return { ...item, book: null };
                        }
                    })
                );
                setCartItems(itemsWithDetails);
            } else {
                setCartItems([]);
            }
        } catch (error) {
            console.error('Failed to fetch cart', error);
        } finally {
            setLoading(false);
        }
    };

    const removeItem = async (itemId) => {
        try {
            await api.delete(`/carts/items/${itemId}/`);
            setCartItems(cartItems.filter(item => item.id !== itemId));
        } catch (error) {
            console.error('Failed to remove item', error);
            alert('Failed to remove item');
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            if (item.book) {
                return total + (parseFloat(item.book.original_price) * item.quantity);
            }
            return total;
        }, 0).toFixed(2);
    };

    if (loading) return <div className="text-center py-20 text-xl text-gray-600">Loading cart...</div>;

    if (cartItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg shadow-sm border border-gray-100 p-8">
                <ShoppingCart className="w-24 h-24 text-gray-300 mb-6" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-8">Looks like you haven't added any books yet.</p>
                <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded shadow transition">
                    Browse Books
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="divide-y divide-gray-100">
                    {cartItems.map((item) => (
                        <div key={item.id} className="p-6 flex items-center">
                            <div className="w-20 h-28 bg-gray-100 rounded flex items-center justify-center flex-shrink-0 text-gray-400 font-serif text-sm px-1 text-center border border-gray-200">
                                {item.book ? item.book.title : 'Unknown'}
                            </div>

                            <div className="ml-6 flex-grow">
                                <h3 className="text-lg font-bold text-gray-800">
                                    <Link to={`/books/${item.book_id}`} className="hover:text-blue-600 transition">
                                        {item.book ? item.book.title : `Book #${item.book_id}`}
                                    </Link>
                                </h3>
                                <p className="text-gray-500 text-sm mb-2">{item.book ? item.book.author : ''}</p>
                                <div className="font-medium text-gray-900">
                                    {item.book ? `$${parseFloat(item.book.original_price).toFixed(2)}` : 'N/A'} × {item.quantity}
                                </div>
                            </div>

                            <div className="ml-4 flex flex-col items-end">
                                <div className="text-xl font-bold text-gray-900 mb-4">
                                    {item.book ? `$${(parseFloat(item.book.original_price) * item.quantity).toFixed(2)}` : ''}
                                </div>
                                <button
                                    onClick={() => removeItem(item.id)}
                                    className="text-red-500 hover:text-red-700 flex items-center text-sm transition"
                                >
                                    <Trash2 className="w-4 h-4 mr-1" /> Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-gray-50 p-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center">
                    <div className="mb-4 sm:mb-0">
                        <span className="text-gray-600">Total:</span>
                        <span className="text-3xl font-bold text-gray-900 ml-3">${calculateTotal()}</span>
                    </div>
                    <button
                        onClick={() => navigate('/checkout')}
                        className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded shadow-lg transition flex items-center justify-center"
                    >
                        Proceed to Checkout <ArrowRight className="w-5 h-5 ml-2" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Cart;
