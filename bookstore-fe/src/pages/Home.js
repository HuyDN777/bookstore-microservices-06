import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Home() {
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [booksRes, catRes] = await Promise.all([
                api.get('/books/'),
                api.get('/catalog/')
            ]);
            setBooks(booksRes.data);
            setCategories(catRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredBooks = selectedCategory
        ? books.filter(b => b.category_id === selectedCategory)
        : books;

    if (loading) return <div className="text-center py-20 text-xl text-gray-600">Loading books...</div>;

    return (
        <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar - Categories */}
            <aside className="w-full md:w-64 flex-shrink-0">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sticky top-24">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Categories</h2>
                    <ul className="space-y-2">
                        <li>
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={`w-full text-left px-3 py-2 rounded transition ${selectedCategory === null ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                All Books
                            </button>
                        </li>
                        {categories.map(cat => (
                            <li key={cat.id}>
                                <button
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`w-full text-left px-3 py-2 rounded transition ${selectedCategory === cat.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    {cat.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>

            {/* Main Content - Books Grid */}
            <main className="flex-grow">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                    {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : 'All Books'}
                </h1>

                {filteredBooks.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center text-gray-500">
                        No books found in this category.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredBooks.map(book => (
                            <Link to={`/books/${book.id}`} key={book.id} className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden hover:shadow-lg transition duration-200 group">
                                <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden flex items-center justify-center border-b border-gray-100">
                                    {/* Placeholder for book cover */}
                                    <div className="text-gray-400 font-serif text-4xl text-center px-4 group-hover:scale-105 transition-transform duration-300">
                                        {book.title}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-800 truncate mb-1" title={book.title}>{book.title}</h3>
                                    <p className="text-gray-500 text-sm mb-3 truncate">{book.author}</p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-blue-600 font-bold text-lg">${parseFloat(book.original_price).toFixed(2)}</span>
                                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">In Stock</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default Home;
