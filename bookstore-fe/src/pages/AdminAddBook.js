import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, BookPlus, Save } from 'lucide-react';

function AdminAddBook() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchingCats, setFetchingCats] = useState(true);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        author: '',
        original_price: '',
        description: '',
        stock_quantity: 0,
        category_id: ''
    });

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchCategories();
    }, [isAuthenticated, navigate]);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/catalog/');
            setCategories(res.data);
            if (res.data.length > 0) {
                setFormData(prev => ({ ...prev, category_id: res.data[0].id }));
            }
        } catch (err) {
            console.error('Failed to load categories', err);
            setError('Could not load categories. Please check catalog-service.');
        } finally {
            setFetchingCats(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Convert types
            const payload = {
                ...formData,
                original_price: parseFloat(formData.original_price),
                stock_quantity: parseInt(formData.stock_quantity),
                category_id: formData.category_id ? parseInt(formData.category_id) : null
            };

            await api.post('/books/', payload);
            alert('Book added successfully!');
            navigate('/admin');
        } catch (err) {
            console.error('Failed to add book', err);
            setError(err.response?.data ? JSON.stringify(err.response.data) : 'Failed to add book. Try again.');
        } finally {
            setLoading(false);
        }
    };

    if (fetchingCats) return <div className="text-center py-20 text-xl text-gray-600">Loading catalog...</div>;

    return (
        <div className="max-w-3xl mx-auto">
            <Link to="/admin" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 font-medium transition">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Link>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-blue-600 p-6 text-white flex items-center">
                    <BookPlus className="w-8 h-8 mr-3" />
                    <div>
                        <h1 className="text-2xl font-bold text-white">Add New Book</h1>
                        <p className="text-blue-100 text-sm">Fill in the details to expand your bookstore catalog.</p>
                    </div>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Book Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    placeholder="Enter book title"
                                    value={formData.title}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Author</label>
                                <input
                                    type="text"
                                    name="author"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    placeholder="Enter author name"
                                    value={formData.author}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Price ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="original_price"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    placeholder="0.00"
                                    value={formData.original_price}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Stock Quantity</label>
                                <input
                                    type="number"
                                    name="stock_quantity"
                                    required
                                    min="0"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                    value={formData.stock_quantity}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                                <select
                                    name="category_id"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                                    value={formData.category_id}
                                    onChange={handleChange}
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                            <textarea
                                name="description"
                                rows="4"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
                                placeholder="Write a short summary of the book..."
                                value={formData.description}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => navigate('/admin')}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex items-center px-8 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                <Save className="w-5 h-5 mr-2" />
                                {loading ? 'Saving...' : 'Save Book'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AdminAddBook;
