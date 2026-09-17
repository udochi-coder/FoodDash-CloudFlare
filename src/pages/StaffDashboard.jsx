import { useState, useEffect, useCallback } from 'react';
import { getTodaysOrders, updateOrderStatus } from '../api/endpoints';

const STATUS_STYLE = {
    RECEIVED:   { label: 'Received',    cls: 'bg-amber-100 text-amber-700 border-amber-200',      next: 'PREPARING',  action: 'Start Preparing' },
    PREPARING:  { label: 'Preparing',   cls: 'bg-violet-100 text-violet-700 border-violet-200',   next: 'READY',      action: 'Mark Ready' },
    READY:      { label: 'Ready',       cls: 'bg-pink-100 text-pink-700 border-pink-200',         next: null,         action: null },
    DELIVERED:  { label: 'Delivered',   cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', next: null,         action: null },
    PICKED_UP:  { label: 'Picked Up',   cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', next: null,         action: null },
    CANCELLED:  { label: 'Cancelled',   cls: 'bg-red-100 text-red-600 border-red-200',            next: null,         action: null },
};

export default function StaffDashboard() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [filter, setFilter] = useState('ALL');

    const fetchOrders = useCallback(async () => {
        try {
            const { data } = await getTodaysOrders();
            setOrders(data.data || []);
        } catch {
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, [fetchOrders]);

    const handleStatusUpdate = async (orderId, newStatus) => {
        setUpdatingId(orderId);
        try {
            await updateOrderStatus(orderId, { status: newStatus });
            await fetchOrders();
        } catch (err) {
            alert(err.response?.data?.error || 'Could not update status');
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredOrders = filter === 'ALL'
        ? orders
        : orders.filter(o => o.status === filter);

    const counts = orders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        acc.ALL = (acc.ALL || 0) + 1;
        return acc;
    }, {});

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="text-center">
                <div className="animate-spin text-4xl mb-3">🍳</div>
                <p className="text-gray-500">Loading orders...</p>
            </div>
        </div>
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900">Staff Dashboard 👨‍🍳</h1>
                    <p className="text-gray-400 text-sm mt-0.5">Auto-refreshes every 10 seconds</p>
                </div>
                <button
                    onClick={fetchOrders}
                    className="rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:brightness-110"
                >
                    🔄 Refresh
                </button>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 mb-6">
                {['ALL', 'RECEIVED', 'PREPARING', 'READY', 'DELIVERED', 'PICKED_UP', 'CANCELLED'].map(s => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`rounded-2xl border p-2 text-center transition-all duration-200 ${
                            filter === s
                                ? 'border-violet-500 bg-gradient-to-r from-violet-600 to-pink-500 text-white'
                                : 'border-gray-100 bg-white hover:border-violet-200 hover:bg-violet-50'
                        }`}
                    >
                        <div className="font-bold text-lg">{counts[s] || 0}</div>
                        <div className="text-xs truncate">{s === 'ALL' ? 'All' : STATUS_STYLE[s]?.label}</div>
                    </button>
                ))}
            </div>

            {filteredOrders.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <div className="text-5xl mb-3">🎉</div>
                    <p className="font-medium">No orders in this status</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map(order => {
                        const orderId = order.ID ?? order.id;
                        const s = STATUS_STYLE[order.status] || {
                            label: order.status,
                            cls: 'bg-gray-100 text-gray-600 border-gray-200',
                            next: null,
                            action: null,
                        };
                        const nextStatus = order.status === 'READY'
                            ? order.type === 'pickup' ? 'PICKED_UP' : 'DELIVERED'
                            : s.next;
                        const nextAction = order.status === 'READY'
                            ? order.type === 'pickup' ? 'Mark Picked Up' : 'Mark Delivered'
                            : s.action;
                        const date = new Date(order.created_at ?? order.CreatedAt);
                        return (
                            <div
                                key={orderId}
                                className={`rounded-3xl border border-violet-100 bg-white p-5 shadow-sm transition-all duration-200 ${
                                    updatingId === orderId ? 'opacity-50' : 'hover:shadow-md'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-bold text-gray-900">Order #{orderId}</p>
                                        <p className="text-sm text-gray-400">
                                            {order.user?.name || 'Customer'} ·{' '}
                                            {date.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 flex-wrap justify-end">
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${s.cls}`}>
                                            {s.label}
                                        </span>
                                        {nextStatus && (
                                            <button
                                                onClick={() => handleStatusUpdate(orderId, nextStatus)}
                                                disabled={!!updatingId}
                                                className="rounded-full bg-gradient-to-r from-violet-600 to-pink-500 px-3 py-1 text-xs font-semibold text-white transition-all duration-200 hover:brightness-110 disabled:opacity-50"
                                            >
                                                {nextAction} →
                                            </button>
                                        )}
                                        {!['CANCELLED', 'DELIVERED', 'PICKED_UP'].includes(order.status) && (
                                            <button
                                                onClick={() => handleStatusUpdate(orderId, 'CANCELLED')}
                                                disabled={!!updatingId}
                                                className="text-xs font-semibold bg-red-50 text-red-500 px-3 py-1 rounded-full hover:bg-red-100 disabled:opacity-50 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t border-gray-50 pt-3 space-y-1">
                                    {order.items?.map((item, i) => {
                                        const menuItem = item.menu_item ?? {};
                                        return (
                                            <div key={i} className="flex justify-between text-sm">
                                                <span className="text-gray-700">
                                                    <span className="font-semibold">{item.quantity}×</span> {menuItem.name}
                                                </span>
                                                <span className="text-gray-500">
                                                    ₦{(Number(item.unit_price) * item.quantity).toLocaleString('en-NG')}
                                                </span>
                                            </div>
                                        );
                                    })}
                                    <div className="flex justify-between border-t border-gray-50 pt-1 font-bold text-violet-700">
                                        <span>Total</span>
                                        <span>₦{Number(order.total_amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
