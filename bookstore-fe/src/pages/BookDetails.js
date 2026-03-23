import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function BookDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    const [book, setBook] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState(false);

    useEffect(() => {
        fetchBookData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchBookData = async () => {
        setLoading(true);
        try {
            // Fetch book info. Book-service will trigger history write to recommender-ai
            // if headers include X-Customer-Id, which is handled via token interceptor in backend/api-gateway.
            const bookRes = await api.get(`/books/${id}/`);
            setBook(bookRes.data);

            // Fetch reviews
            const reviewRes = await api.get(`/reviews/?book_id=${id}`);
            setReviews(reviewRes.data);

            // If logged in, fetch recommendations
            if (isAuthenticated && user?.email) {
                // In real app, we need the exact customer ID, here we assume customer ID can be retrieved
                // from the backend or token validation. For the sake of UI demo, we will try fetching using a static 1 or skip if not available,
                // actually API gateway extracts customer_id from JWT and forwards it. 
                // So let's fetch recommendations for the currently logged in customer.
                try {
                    // Since recommender view requires customer_id in query, but our token has it:
                    // To get customer id from token, normally we'd decode it. Here we can use validate token endpoint or just skip. 
                    // We'll skip fetching recommendations directly here unless we decode JWT.
                } catch (e) { }
            }

        } catch (error) {
            console.error('Failed to load book', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            if (window.confirm('You need to login to add items to cart. Go to login?')) {
                navigate('/login');
            }
            return;
        }

        setAddingToCart(true);
        try {
            // Note: cart items API requires cart_id. In this architecture, customer creates cart on register.
            // We need to fetch customer's cart first.
            const cartsRes = await api.get('/carts/');
            // Assuming the user has one cart that belongs to them (we would filter by customer_id if API supported it)
            // For this demo, we'll try to add to the first cart or handle error
            if (cartsRes.data && cartsRes.data.length > 0) {
                // pick the most recent cart or assume the only one belongs to user
                const userCart = cartsRes.data[0].id;
                await api.post('/carts/items/', {
                    cart: userCart,
                    book_id: book.id,
                    quantity: 1
                });
                alert('Added to cart successfully!');
            } else {
                alert('Cart not found. Contact support.');
            }
        } catch (error) {
            console.error('Adding to cart failed', error);
            alert('Failed to add to cart.');
        } finally {
            setAddingToCart(false);
        }
    };

    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    const handleAddReview = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            alert('Please login to submit a review.');
            navigate('/login');
            return;
        }
        if (!newComment.trim()) {
            alert('Please enter a comment.');
            return;
        }

        setSubmittingReview(true);
        try {
            const payload = {
                book_id: parseInt(id),
                rating: newRating,
                comment: newComment
            };
            const res = await api.post('/reviews/', payload);
            setReviews([...reviews, res.data]);
            setNewComment('');
            setNewRating(5);
            alert('Review submitted successfully!');
        } catch (error) {
            console.error('Failed to submit review', error);
            alert('Failed to submit review.');
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) return <div className="text-center py-20 text-xl text-gray-600">Loading details...</div>;
    if (!book) return <div className="text-center py-20 text-xl text-red-500">Book not found.</div>;

    return (
        <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 bg-gray-100 flex items-center justify-center p-12 border-b md:border-b-0 md:border-r border-gray-100">
                        <div className="text-gray-400 font-serif text-5xl text-center">
                            {book.title}
                        </div>
                    </div>

                    <div className="md:w-2/3 p-8">
                        <div className="uppercase tracking-wide text-sm text-blue-600 font-bold mb-1">
                            {book.category?.name || 'Uncategorized'}
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
                        <p className="text-lg text-gray-600 mb-6 font-serif italic">by {book.author}</p>

                        <div className="flex items-center mb-6">
                            <span className="text-3xl font-bold text-gray-900 mr-4">${parseFloat(book.original_price).toFixed(2)}</span>
                            {book.stock_quantity > 0 ? (
                                <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded border border-green-200">In Stock ({book.stock_quantity})</span>
                            ) : (
                                <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded border border-red-200">Out of Stock</span>
                            )}
                        </div>

                        <p className="text-gray-700 leading-relaxed mb-8 border-t border-b border-gray-100 py-6">
                            {book.description || "No description available for this book."}
                        </p>

                        <button
                            onClick={handleAddToCart}
                            disabled={addingToCart || book.stock_quantity === 0}
                            className={`flex items-center justify-center w-full md:w-auto px-8 py-3 text-white font-bold rounded shadow-lg transition duration-200 ${addingToCart || book.stock_quantity === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            <ShoppingCart className="w-5 h-5 mr-2" />
                            {addingToCart ? 'Adding...' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Customer Reviews</h2>

                {/* Review Form */}
                {isAuthenticated ? (
                    <form onSubmit={handleAddReview} className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Write a Review</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                            <div className="flex space-x-2">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        type="button"
                                        key={star}
                                        onClick={() => setNewRating(star)}
                                        className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                                    >
                                        <Star className={`w-6 h-6 ${star <= newRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                            <textarea
                                id="comment"
                                rows="3"
                                className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
                                placeholder="Share your thoughts about this book..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            disabled={submittingReview}
                            className={`px-4 py-2 text-white font-bold rounded transition duration-200 ${submittingReview ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </form>
                ) : (
                    <div className="mb-8 p-4 bg-blue-50 text-blue-800 rounded-lg flex items-center justify-between">
                        <span>Please log in to share your thoughts.</span>
                        <button onClick={() => navigate('/login')} className="px-4 py-2 bg-white text-blue-600 font-bold rounded shadow-sm hover:bg-gray-50">Log In</button>
                    </div>
                )}

                {reviews.length === 0 ? (
                    <p className="text-gray-500 italic">No reviews yet. Be the first to review!</p>
                ) : (
                    <div className="space-y-6">
                        {reviews.map(review => (
                            <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                                <div className="flex items-center mb-2">
                                    <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                                        ))}
                                    </div>
                                    <span className="ml-2 text-sm text-gray-500 font-medium">User #{review.customer_id}</span>
                                </div>
                                <p className="text-gray-700">{review.comment}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default BookDetails;
