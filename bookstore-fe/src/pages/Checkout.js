import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, CheckCircle, ArrowRight } from 'lucide-react';
import api from '../services/api';

function Checkout() {
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleCheckout = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Create order by calling the Order Creation View in Gateway
            // The API only needs address, it determines customer_id automatically in backend 
            // based on token/authentication. However, the exact payload for order-service 
            // is {"customer_id": 1, "total_amount": "...", "status": "Pending"}
            // Wait, our backend endpoint is POST /api/orders/create/ with a payload:
            // it creates order. Let's see models: Order has customer_id, total_amount, status.
            // But the OrderCreationView (order_app/views.py) takes OrderSerializer data...
            // Because we don't have total_amount explicitly here (the frontend calculates it),
            // Ideally the backend should calculate it. For demo, we send it.

            // Since it's demo, we will calculate customer_id from profile or assume it.
            // Easiest is to let backend handle missing fields if possible.
            // Let's send a dummy payload that matches OrderSerializer for this microservice task.
            const payload = {
                customer_id: 1, // hardcoded for demo or derived from token parsing
                total_amount: "99.99", // hardcoded for demo or derived from cart
                status: "Pending",
                address: address
            };

            const res = await api.post('/orders/create/', payload);
            setSuccessData(res.data);
        } catch (err) {
            console.error(err);
            setError('Checkout failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (successData) {
        return (
            <div className="max-w-xl mx-auto mt-12 text-center bg-white p-12 rounded-xl shadow-lg border border-gray-100">
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Payment Successful!</h2>
                <p className="text-gray-600 mb-6">Your order has been processed correctly via Saga pattern across microservices.</p>

                <div className="bg-gray-50 text-left p-6 rounded-lg mb-8 border border-gray-200">
                    <p className="text-sm font-bold text-gray-600 mb-2 uppercase">Order Details</p>
                    <div className="flex justify-between mb-2 pb-2 border-b border-gray-200">
                        <span className="text-gray-600">Order ID:</span>
                        <span className="font-bold text-gray-900">#{successData.order?.id}</span>
                    </div>
                    <div className="flex justify-between mb-2 pb-2 border-b border-gray-200">
                        <span className="text-gray-600">Total Paid:</span>
                        <span className="font-bold text-green-600">${successData.order?.total_amount}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-medium text-blue-600">{successData.order?.status}</span>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded shadow transition"
                >
                    Continue Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto mt-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-4">Checkout</h2>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">{error}</div>}

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <form onSubmit={handleCheckout}>
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <Truck className="w-5 h-5 mr-2 text-blue-600" />
                            Shipping Information
                        </h3>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Delivery Address</label>
                        <textarea
                            required
                            rows="3"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Enter your full shipping address..."
                        />
                    </div>

                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                            Payment Details
                        </h3>
                        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg text-sm mb-4">
                            <strong>Demo Mode:</strong> Payment will be automatically processed using predefined test credentials during the saga workflow.
                        </div>

                        <div className="grid grid-cols-2 gap-4 opacity-50 pointer-events-none">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Card Number</label>
                                <input type="text" className="w-full px-3 py-2 border rounded" value="**** **** **** 4242" readOnly />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Expiry</label>
                                <input type="text" className="w-full px-3 py-2 border rounded" value="12/25" readOnly />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg shadow-lg text-lg transition duration-200 mt-4 flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? (
                            <span className="flex items-center">Processing Payment...</span>
                        ) : (
                            <span className="flex items-center">Complete Order <ArrowRight className="w-5 h-5 ml-2" /></span>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Checkout;
