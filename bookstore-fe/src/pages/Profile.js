import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen } from 'lucide-react';

function Profile() {
    const { user, logout } = useAuth();
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        setLoading(true);
        try {
            // Fetch recommendations automatically using the JWT token
            // The API Gateway adds X-Customer-Id to the downstream request
            const recsRes = await api.get('/recommendations/');

            // Recommender API returns [{id, book_id, score, reason}, ...]
            // So we need to fetch book details for these recommended books
            const recommendedItems = recsRes.data;
            if (recommendedItems.length > 0) {
                // Fetch book details manually or assume API gateway allows
                // But typically we should do Promise.all
                const detailedBooks = await Promise.all(
                    recommendedItems.map(async (r) => {
                        try {
                            const bookResp = await api.get(`/books/${r.book_id}/`);
                            return { ...bookResp.data, reason: r.reason, score: r.score };
                        } catch (e) {
                            return null;
                        }
                    })
                );
                setRecommendations(detailedBooks.filter(b => b !== null));
            }
        } catch (error) {
            console.error('Failed to load profile data', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-20 text-xl text-gray-600">Loading profile...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
                    <p className="text-gray-600">{user?.email}</p>
                </div>
                <button
                    onClick={logout}
                    className="px-6 py-2 bg-red-50 text-red-600 font-bold rounded shadow-sm hover:bg-red-100 transition"
                >
                    Log Out
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <BookOpen className="w-6 h-6 mr-3 text-blue-600" />
                    Recommended For You
                </h2>
                {recommendations.length === 0 ? (
                    <div className="text-center p-12 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <p className="text-gray-500 italic">No recommendations available yet.</p>
                        <p className="text-sm text-gray-400 mt-2">Explore some books to get personalized suggestions!</p>
                        <Link to="/" className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700">
                            Browse Books
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {recommendations.map(book => (
                            <Link to={`/books/${book.id}`} key={book.id} className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-lg transition duration-200 group flex flex-col">
                                <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden flex items-center justify-center">
                                    <div className="text-gray-500 font-serif text-2xl text-center px-4 group-hover:scale-105 transition-transform duration-300">
                                        {book.title}
                                    </div>
                                    <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded shadow">
                                        Match: {Math.round(book.score * 100)}%
                                    </div>
                                </div>
                                <div className="p-4 flex-grow flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-bold text-gray-800 truncate mb-1" title={book.title}>{book.title}</h3>
                                        <p className="text-gray-500 text-xs mb-3 italic">{book.reason}</p>
                                    </div>
                                    <span className="text-blue-600 font-bold">${parseFloat(book.original_price).toFixed(2)}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Profile;
