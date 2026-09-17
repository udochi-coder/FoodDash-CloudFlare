import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { updateCartItem, removeCartItem, clearCart, placeOrder } from '../api/endpoints';

export default function CartPage() {
    const { cart, refreshCart } = useCart();
    const navigate = useNavigate();
    const [placingOrder, setPlacingOrder] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);
    const [orderType, setOrderType] = useState('delivery');
    const [address, setAddress] = useState('');

    const items = cart?.items || [];
    const subtotal = items.reduce((sum, i) => sum + Number(i.menu_item?.price) * i.quantity, 0);
    const total = subtotal;

    const handleQty = async (itemId, newQty) => {
        setUpdatingId(itemId);
        try {
            if (newQty < 1) {
                await removeCartItem(itemId);
            } else {
                await updateCartItem(itemId, { quantity: newQty });
            }
            await refreshCart();
        } catch (err) {
            alert(err.response?.data?.error || 'Could not update cart');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleRemove = async (itemId) => {
        setUpdatingId(itemId);
        try {
            await removeCartItem(itemId);
            await refreshCart();
        } catch {
            alert('Could not remove item');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleClearCart = async () => {
        if (!confirm('Clear your entire cart?')) return;
        try {
            await clearCart();
            await refreshCart();
        } catch {
            alert('Could not clear cart');
        }
    };

    const handlePlaceOrder = async () => {
        if (orderType === 'delivery' && !address.trim()) {
            alert('Please enter a delivery address');
            return;
        }
        setPlacingOrder(true);
        try {
            const { data } = await placeOrder({
                type: orderType,
                delivery_address: orderType === 'delivery' ? address.trim() : '',
            });
            await refreshCart();
            const newOrderId = data.data.ID ?? data.data.id;
            navigate(`/orders/${newOrderId}`);
        } catch (err) {
            alert(err.response?.data?.error || 'Could not place order');
        } finally {
            setPlacingOrder(false);
        }
    };

    if (items.length === 0) return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-7xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Add some delicious items from our menu!</p>
            <Link
                to="/"
                className="rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 px-6 py-3 font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition-all duration-200 hover:brightness-110"
            >
                Browse Menu
            </Link>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-extrabold text-gray-900">Your Cart 🛒</h1>
                <button
                    onClick={handleClearCart}
                    className="text-sm text-red-400 hover:text-red-600 transition-colors"
                >
                    Clear all
                </button>
            </div>

            <div className="space-y-3 mb-6">
                {items.map(item => {
                    const id = item.ID ?? item.id;
                    const menuItem = item.menu_item ?? {};
                    return (
                        <div
                            key={id}
                            className={`flex items-center gap-4 rounded-3xl border border-violet-100 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md ${
                                updatingId === id ? 'opacity-50' : ''
                            }`}
                        >
                            {menuItem.image_url ? (
                                <img src={menuItem.image_url} alt={menuItem.name} className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
                            ) : (
                                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-pink-100 text-2xl">🍽️</div>
                            )}

                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 truncate">{menuItem.name}</h3>
                                <p className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-sm font-bold text-transparent">
                                    ₦{Number(menuItem.price).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleQty(id, item.quantity - 1)}
                                    disabled={!!updatingId}
                                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold text-gray-700 disabled:opacity-40"
                                >
                                    −
                                </button>
                                <span className="w-6 text-center font-semibold">{item.quantity}</span>
                                <button
                                    onClick={() => handleQty(id, item.quantity + 1)}
                                    disabled={!!updatingId}
                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold transition-all duration-200 hover:brightness-110 disabled:opacity-40"
                                >
                                    +
                                </button>
                            </div>

                            <div className="text-right min-w-[80px]">
                                <p className="font-bold text-gray-900">
                                    ₦{(Number(menuItem.price) * item.quantity).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                                </p>
                                <button
                                    onClick={() => handleRemove(id)}
                                    className="text-xs text-red-400 hover:text-red-600 mt-1"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>

                <div className="mb-4 flex gap-2">
                    <button
                        onClick={() => setOrderType('delivery')}
                        className={`flex-1 rounded-xl py-2 text-sm font-semibold border ${
                            orderType === 'delivery' ? 'border-violet-600 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-500'
                        }`}
                    >
                        🛵 Delivery
                    </button>
                    <button
                        onClick={() => setOrderType('pickup')}
                        className={`flex-1 rounded-xl py-2 text-sm font-semibold border ${
                            orderType === 'pickup' ? 'border-violet-600 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-500'
                        }`}
                    >
                        🏃 Pickup
                    </button>
                </div>

                {orderType === 'delivery' && (
                    <input
                        type="text"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        placeholder="Enter delivery address"
                        className="mb-4 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none"
                    />
                )}

                <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>₦{subtotal.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="h-px bg-gray-100 my-2" />
                    <div className="flex justify-between font-extrabold text-base text-gray-900">
                        <span>Total</span>
                        <span className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">₦{total.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>

                <button
                    onClick={handlePlaceOrder}
                    disabled={placingOrder}
                    className="mt-5 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 py-3.5 text-base font-bold text-white transition-all duration-200 hover:brightness-110 disabled:opacity-50 active:scale-95"
                >
                    {placingOrder ? 'Placing Order...' : '🛍️ Place Order'}
                </button>

                <Link to="/" className="mt-3 block text-center text-sm text-gray-500 transition-colors hover:text-violet-600">
                    ← Continue shopping
                </Link>
            </div>
        </div>
    );
}
