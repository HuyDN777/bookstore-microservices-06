import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Register() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        address: ''
    });
    const [error, setError] = useState('');
    const { register, loading } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Map to API expected data
        const payload = {
            username: formData.email.split('@')[0], // API requires username, generate from email
            email: formData.email,
            password: formData.password,
            name: `${formData.firstName} ${formData.lastName}`,
            phone: formData.phone,
            address: formData.address
        };

        try {
            await register(payload);
            navigate('/');
        } catch (err) {
            if (err.response?.data) {
                setError(JSON.stringify(err.response.data));
            } else {
                setError('Failed to register. Please try again.');
            }
        }
    };

    return (
        <div className="flex justify-center flex-col items-center mt-12 pb-12">
            <div className="w-full max-w-lg bg-white rounded-lg shadow-xl p-8 border border-gray-100">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Create Account</h2>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm break-words">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">First Name</label>
                            <input type="text" name="firstName" required className="w-full px-3 py-2 border rounded focus:ring" value={formData.firstName} onChange={handleChange} />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Last Name</label>
                            <input type="text" name="lastName" required className="w-full px-3 py-2 border rounded focus:ring" value={formData.lastName} onChange={handleChange} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
                        <input type="email" name="email" required className="w-full px-3 py-2 border rounded focus:ring" value={formData.email} onChange={handleChange} />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                        <input type="password" name="password" required className="w-full px-3 py-2 border rounded focus:ring" value={formData.password} onChange={handleChange} />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Phone</label>
                        <input type="tel" name="phone" required className="w-full px-3 py-2 border rounded focus:ring" value={formData.phone} onChange={handleChange} />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Address</label>
                        <textarea name="address" required rows="2" className="w-full px-3 py-2 border rounded focus:ring" value={formData.address} onChange={handleChange} />
                    </div>

                    <button type="submit" disabled={loading} className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded shadow-lg transition mt-6 ${loading ? 'opacity-70' : ''}`}>
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Sign in</Link>
                </div>
            </div>
        </div>
    );
}

export default Register;
