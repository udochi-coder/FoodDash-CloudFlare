import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../api/endpoints';

const STATUS_STYLE = {
    PENDING:    { label: 'Pending',     cls: 'bg-amber-100 text-amber-700' },
    CONFIRMED:  { label: 'Confirmed',   cls: 'bg-blue-100 text-blue-700' },
    PREPARING:  { label: 'Preparing',   cls: 'bg-violet-100 text-violet-700' },
    READY:      { label: 'Ready',       cls: 'bg-pink-100 text-pink-700' },
    DELIVERED:  { label: 'Delivered',   cls: 'bg-emerald-100 text-emerald-700' },
    PICKED_UP:  { label: 'Picked Up',   cls: 'bg-emerald-100 text-emerald-700' },
    CANCELLED:  { label: 'Cancelled',   cls: 'bg-red-100 text-red-600' },
};

export default function OrderHistoryPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMyOrders()
            .then(({ data }) => setOrders(data.data || []))
            .catch(() => setOrders([]))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="text-center">
                <div className="animate-spin text-4xl mb-3">🍳</div>
                <p className="text-gray-500">Loading orders...</p>
            </div>
        </div>
    );

    if (orders.length === 0) return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-7xl mb-4">📋</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">Your order history will appear here</p>
            <Link to="/" className="rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 px-6 py-3 font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition-all duration-200 hover:brightness-110">
                Start Ordering 🍽️
            </Link>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-6">My Orders 📋</h1>

            <div className="space-y-4">
                {orders.map(order => {
                    const orderId = order.ID ?? order.id;
                    const status = STATUS_STYLE[order.status] || { label: order.status, cls: 'bg-gray-100 text-gray-600' };
                    const isActive = !['DELIVERED', 'PICKED_UP', 'CANCELLED'].includes(order.status);
                    const date = new Date(order.created_at ?? order.CreatedAt);

                    return (
                        <Link
                            key={orderId}
                            to={`/orders/${orderId}`}
                            className="block rounded-3xl border border-violet-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-100"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-gray-900">Order #{orderId}</p>
                                    <p className="text-sm text-gray-400 mt-0.5">
                                        {date.toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' })} ·{' '}
                                        {date.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.cls}`}>
                                        {status.label}
                                    </span>
                                    {isActive && (
                                        <span className="animate-pulse text-xs font-medium text-violet-600">● Live</span>
                                    )}
                                </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between items-center">
                                <div className="text-sm text-gray-500">
                                    {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                                    {order.items?.slice(0, 2).map(i => ` · ${i.menu_item?.name}`).join('')}
                                    {(order.items?.length || 0) > 2 ? '...' : ''}
                                </div>
                                <span className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text font-extrabold text-transparent">
                                    ₦{Number(order.total_amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}