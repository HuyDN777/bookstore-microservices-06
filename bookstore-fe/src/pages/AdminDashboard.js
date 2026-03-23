import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Users, DollarSign, ShoppingBag, Truck, Plus } from 'lucide-react';

function AdminDashboard() {
    const { isAuthenticated, user } = useAuth();
    const [reports, setReports] = useState([]);
    const [staffs, setStaffs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAuthenticated) {
            fetchDashboardData();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [reportRes, staffRes] = await Promise.all([
                api.get('/manager/'),
                api.get('/staff/')
            ]);
            setReports(reportRes.data);
            setStaffs(staffRes.data);
        } catch (error) {
            console.error('Failed to load dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) return <div className="text-center py-20 text-xl text-gray-600">Please log in to view the dashboard.</div>;
    if (loading) return <div className="text-center py-20 text-xl text-gray-600">Loading dashboard data...</div>;

    const totalRevenue = reports.reduce((sum, item) => sum + parseFloat(item.total_amount), 0);
    const successfulOrders = reports.filter(r => r.payment_status.includes('Success')).length;

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <BarChart className="w-8 h-8 mr-3 text-indigo-600" />
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-500 mt-1">Hello, {user?.email}. Here's what's happening internally.</p>
                </div>
                <div className="flex space-x-4">
                    <Link
                        to="/admin/add-category"
                        className="flex items-center px-6 py-2 bg-white text-indigo-600 font-bold rounded-lg shadow-md border border-indigo-100 hover:bg-indigo-50 transition duration-200"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Category
                    </Link>
                    <Link
                        to="/admin/add-book"
                        className="flex items-center px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 transition duration-200"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add New Book
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-indigo-100 p-6 flex items-start">
                    <div className="bg-indigo-50 text-indigo-600 p-3 rounded-lg mr-4"><DollarSign className="w-8 h-8" /></div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Total Revenue</p>
                        <p className="text-3xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6 flex items-start">
                    <div className="bg-blue-50 text-blue-600 p-3 rounded-lg mr-4"><ShoppingBag className="w-8 h-8" /></div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Total Sales Count</p>
                        <p className="text-3xl font-bold text-gray-900">{reports.length}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6 flex items-start">
                    <div className="bg-purple-50 text-purple-600 p-3 rounded-lg mr-4"><Users className="w-8 h-8" /></div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Active Staff</p>
                        <p className="text-3xl font-bold text-gray-900">{staffs.length}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Reports/Recent Orders */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h2 className="font-bold text-gray-800 text-lg">Sales Report (<code className="text-xs bg-gray-200 px-1 rounded">manager-service</code>)</h2>
                    </div>
                    <div className="p-0">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reports.length > 0 ? reports.map(report => (
                                    <tr key={report.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{(report.order_id).toString().padStart(4, '0')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${parseFloat(report.total_amount).toFixed(2)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {report.payment_status.includes('Success') ?
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Paid</span> :
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="3" className="px-6 py-4 text-center text-gray-500">No reports generated yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Staff Control */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                        <h2 className="font-bold text-gray-800 text-lg">Warehouse Staff (<code className="text-xs bg-gray-200 px-1 rounded">staff-service</code>)</h2>
                    </div>
                    <div className="p-0">
                        <ul className="divide-y divide-gray-200">
                            {staffs.length > 0 ? staffs.map(staff => (
                                <li key={staff.id} className="p-6 flex justify-between items-center hover:bg-gray-50 transition">
                                    <div className="flex items-center">
                                        <div className="bg-gray-200 rounded-full h-10 w-10 flex items-center justify-center text-gray-600 font-bold mr-4">
                                            {staff.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{staff.name}</p>
                                            <p className="text-sm text-gray-500">{staff.role}</p>
                                        </div>
                                    </div>
                                    <div>
                                        {staff.status === 'Available' ? (
                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Available
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                                                <Truck className="w-3 h-3 mr-1" /> Busy Delivering
                                            </span>
                                        )}
                                    </div>
                                </li>
                            )) : (
                                <li className="p-6 text-center text-gray-500">No staff registered</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
