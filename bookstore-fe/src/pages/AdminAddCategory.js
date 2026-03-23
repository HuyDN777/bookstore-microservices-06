import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Tags, Save } from 'lucide-react';

function AdminAddCategory() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/catalog/', formData);
            alert('Category created successfully!');
            navigate('/admin');
        } catch (err) {
            console.error('Failed to create category', err);
            setError(err.response?.data ? JSON.stringify(err.response.data) : 'Failed to create category.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Link to="/admin" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 font-medium transition">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Link>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-indigo-600 p-8 text-white flex items-center">
                    <div className="bg-white/20 p-3 rounded-xl mr-4">
                        <Tags className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">New Category</h1>
                        <p className="text-indigo-100 text-sm opacity-90">Classify your books for better discovery.</p>
                    </div>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Category Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                placeholder="e.g. Science Fiction, Biography..."
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                            <textarea
                                name="description"
                                rows="4"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none"
                                placeholder="What kind of books belong here?"
                                value={formData.description}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <div className="pt-6 border-t border-gray-50 flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => navigate('/admin')}
                                className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex items-center px-10 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                <Save className="w-5 h-5 mr-2" />
                                {loading ? 'Creating...' : 'Create Category'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AdminAddCategory;
