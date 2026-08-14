import { useParams, Link } from 'react-router-dom';
import { useOrderStatus } from '../hooks/useOrderStatus';

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED'];

const STATUS_META = {
    PENDING:    { icon: '🕐', label: 'Order Received',    color: 'text-amber-600', bg: 'bg-amber-50' },
    CONFIRMED:  { icon: '✅', label: 'Order Confirmed',   color: 'text-blue-600',  bg: 'bg-blue-50' },
    PREPARING:  { icon: '👨‍🍳', label: 'Being Prepared',  color: 'text-violet-600', bg: 'bg-violet-50' },
    READY:      { icon: '🛵', label: 'Out for Delivery', color: 'text-pink-600',   bg: 'bg-pink-50' },
    DELIVERED:  { icon: '🎉', label: 'Delivered!',        color: 'text-emerald-600', bg: 'bg-emerald-50' },
    PICKED_UP:  { icon: '🎉', label: 'Picked Up!',        color: 'text-emerald-600', bg: 'bg-emerald-50' },
    CANCELLED:  { icon: '❌', label: 'Cancelled',         color: 'text-red-500',    bg: 'bg-red-50' },
};

export default function OrderPage() {
    const { id } = useParams();
    const { order } = useOrderStatus(id);

    if (!order) return (
        <div className="flex items-center justify-center h-64">
            <div className="text-center">
                <div className="animate-spin text-4xl mb-3">🍳</div>
                <p className="text-gray-500">Loading order...</p>
            </div>
        </div>
    );

    const orderId = order.ID ?? order.id;
    const meta = STATUS_META[order.status] || STATUS_META.PENDING;
    const currentStep = STATUS_STEPS.indexOf(order.status);
    const isFinal = ['DELIVERED', 'PICKED_UP', 'CANCELLED'].includes(order.status);

    return (
        <div className="max-w-xl mx-auto">
            {/* Status Hero */}
            <div className={`rounded-3xl ${meta.bg} p-8 text-center mb-6 shadow-sm`}>
                <div className="text-6xl mb-3">{meta.icon}</div>
                <h1 className={`text-2xl font-extrabold ${meta.color}`}>{meta.label}</h1>
                <p className="text-gray-500 text-sm mt-1">Order #{orderId}</p>
                {!isFinal && (
                    <p className="text-xs text-gray-400 mt-2 animate-pulse">
                        🔄 Refreshing every 5 seconds...
                    </p>
                )}
            </div>

            {/* Progress Bar (not shown for cancelled) */}
            {order.status !== 'CANCELLED' && (
                <div className="mb-6 rounded-3xl border border-violet-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        {STATUS_STEPS.map((step, i) => {
                            const done = i <= currentStep;
                            const active = i === currentStep;
                            return (
                                <div key={step} className="flex-1 flex flex-col items-center gap-1">
                                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all ${
                                        done ? 'bg-gradient-to-r from-violet-600 to-pink-500 text-white' : 'bg-gray-100 text-gray-400'
                                    } ${active ? 'ring-4 ring-violet-100' : ''}`}>
                                        {done ? '✓' : i + 1}
                                    </div>
                                    <span className={`hidden text-center text-xs sm:block ${done ? 'font-medium text-violet-600' : 'text-gray-400'}`}>
                                        {STATUS_META[step]?.label.split(' ')[0]}
                                    </span>
                                    {i < STATUS_STEPS.length - 1 && (
                                        <div className={`absolute`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-violet-600 to-pink-500 transition-all duration-700"
                            style={{ width: `${Math.max(0, (currentStep / (STATUS_STEPS.length - 1)) * 100)}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
                <h2 className="font-bold text-gray-900 mb-4">Items Ordered</h2>
                <div className="space-y-3">
                    {order.items?.map((item, i) => {
                        const menuItem = item.menu_item ?? {};
                        return (
                            <div key={i} className="flex justify-between items-center">
                                <div>
                                    <span className="font-medium text-gray-800">{menuItem.name}</span>
                                    <span className="text-gray-400 text-sm ml-2">×{item.quantity}</span>
                                </div>
                                <span className="text-gray-700 font-semibold">
                                    ₦{(Number(item.unit_price) * item.quantity).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        );
                    })}
                </div>
                <div className="h-px bg-gray-100 my-4" />
                <div className="flex justify-between bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text font-extrabold text-transparent">
                    <span>Total</span>
                    <span>₦{Number(order.total_amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                </div>
            </div>

            <div className="flex gap-3">
                <Link to="/orders" className="flex-1 text-center border border-gray-200 text-gray-600 py-3 rounded-xl hover:bg-gray-50 transition-colors font-medium">
                    All Orders
                </Link>
                {isFinal && (
                    <Link to="/" className="flex-1 rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 py-3 text-center font-semibold text-white transition-all duration-200 hover:brightness-110">
                        Order Again 🍽️
                    </Link>
                )}
            </div>
        </div>
    );
}