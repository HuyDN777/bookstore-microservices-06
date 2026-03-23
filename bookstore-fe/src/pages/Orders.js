import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Package, Truck, CreditCard, Clock } from 'lucide-react';

function Orders() {
    const { isAuthenticated } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAuthenticated) {
            fetchOrders();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await api.get('/orders/create/');
            setOrders(response.data);
        } catch (error) {
            console.error('Failed to load orders', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return <div className="text-center py-20 text-xl text-gray-600">Please log in to view your orders.</div>;
    }

    if (loading) return <div className="text-center py-20 text-xl text-gray-600">Loading order history...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
                <Package className="w-8 h-8 mr-3 text-blue-600" />
                Order History
            </h1>

            {orders.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="text-gray-400 mb-4 flex justify-center"><Package className="w-16 h-16" /></div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No orders found</h3>
                    <p className="text-gray-500">You haven't placed any orders yet. Start shopping!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => (
                        <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gray-50 border-b border-gray-100 p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center">
                                <div>
                                    <span className="text-sm font-medium text-gray-500 uppercase">Order #{order.id}</span>
                                    <h3 className="text-lg font-bold text-gray-800 mt-1">
                                        Total: <span className="text-blue-600">${parseFloat(order.total_amount).toFixed(2)}</span>
                                    </h3>
                                </div>
                                <div className="mt-2 md:mt-0 flex items-center bg-white px-3 py-1 rounded-full border shadow-sm">
                                    <Clock className="w-4 h-4 text-gray-400 mr-2" />
                                    <span className="text-sm font-medium text-gray-600">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 md:p-6 bg-white">
                                <h4 className="font-bold text-gray-800 mb-4">Status Fulfillment</h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="border rounded-lg p-4 flex items-start">
                                        <div className="bg-blue-50 p-2 rounded-full mr-4">
                                            <CreditCard className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Payment</p>
                                            <p className={`text-sm mt-1 font-bold ${order.status.includes('Payment: Success') ? 'text-green-600' : 'text-yellow-600'}`}>
                                                {order.status.includes('Payment: Success') ? 'Processed Successfully' : 'Pending Verification'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="border rounded-lg p-4 flex items-start">
                                        <div className="bg-purple-50 p-2 rounded-full mr-4">
                                            <Truck className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Shipping</p>
                                            <p className={`text-sm mt-1 font-bold ${order.status.includes('Shipping: Success') ? 'text-green-600' : 'text-blue-600'}`}>
                                                {order.status.includes('Shipping: Success') ? 'Dispatched to Carrier' : 'Awaiting Dispatch'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Orders;
