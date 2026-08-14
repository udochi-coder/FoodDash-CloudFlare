import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMenu, addToCart } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function MenuPage() {
    const { user } = useAuth();
    const { refreshCart } = useCart();
    const navigate = useNavigate();

    const [menu, setMenu] = useState([]);
    const [activeTab, setTab] = useState(null);
    const [adding, setAdding] = useState(null);
    const [added, setAdded] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMenu()
            .then(({ data }) => {
                const categories = data.data || [];
                setMenu(categories);

                const firstCategory = categories[0];
                const firstCategoryId = firstCategory?.ID ?? firstCategory?.id ?? firstCategory?._id;
                if (firstCategoryId) {
                    setTab(firstCategoryId);
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const handleAdd = async (menuItemId) => {
        if (!user) {
            navigate('/login');
            return;
        }

        setAdding(menuItemId);
        try {
            await addToCart({ menu_item_id: menuItemId, quantity: 1 });
            await refreshCart();
            setAdded(menuItemId);
            setTimeout(() => setAdded(null), 1500);
        } catch (err) {
            alert(err.response?.data?.error || 'Could not add to cart');
        } finally {
            setAdding(null);
        }
    };

    const activeCategory = menu.find(c => (c.ID ?? c.id ?? c._id) === activeTab);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin text-4xl mb-3">🍳</div>
                    <p className="text-gray-500">Loading menu...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8 rounded-3xl bg-gradient-to-r from-violet-700 via-fuchsia-600 to-pink-500 p-8 text-white shadow-lg shadow-fuchsia-500/20">
                <h1 className="mb-1 text-3xl font-extrabold">What are you craving? 🍽️</h1>
                <p className="text-pink-50">Fresh, hot meals delivered to your door</p>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
                {menu.map(cat => {
                    const categoryId = cat.ID ?? cat.id ?? cat._id;
                    return (
                        <button
                            key={categoryId ?? cat.name}
                            onClick={() => setTab(categoryId)}
                            className={`rounded-full px-5 py-2 text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                                activeTab === categoryId
                                    ? 'scale-105 bg-gradient-to-r from-violet-600 to-pink-500 text-white shadow-lg shadow-fuchsia-500/20'
                                    : 'border border-violet-100 bg-white text-gray-600 hover:border-pink-200 hover:bg-pink-50'
                            }`}
                        >
                            {cat.name}
                        </button>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {activeCategory?.items?.map(item => {
                    const itemId = item.ID ?? item.id ?? item._id;

                    return (
                        <div
                            key={itemId ?? `${item.name}-${item.price}`}
                            className={`flex flex-col overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-100 ${
                                !item.is_available ? 'opacity-60' : ''
                            }`}
                        >
                            {item.image_url ? (
                                <img src={item.image_url} alt={item.name} className="w-full h-44 object-cover" />
                            ) : (
                                <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-violet-100 via-fuchsia-50 to-pink-100 text-5xl">
                                    🍽️
                                </div>
                            )}

                            <div className="p-4 flex flex-col flex-1 gap-2">
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900 text-base">{item.name}</h3>
                                    <p className="text-gray-500 text-sm mt-0.5 line-clamp-2">{item.description}</p>
                                    {!item.is_available && (
                                        <span className="inline-block mt-1 text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                                            Currently unavailable
                                        </span>
                                    )}
                                </div>

                                <div className="flex justify-between items-center mt-2">
                                    <span className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-lg font-extrabold text-transparent">
                                        ₦{Number(item.price).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                                    </span>

                                    <button
                                        onClick={() => handleAdd(itemId)}
                                        disabled={!item.is_available || adding === itemId}
                                        className={`flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                                            added === itemId
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-gradient-to-r from-violet-600 to-pink-500 text-white transition-all duration-200 hover:brightness-110 active:scale-95'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {added === itemId ? '✓ Added' : adding === itemId ? '...' : '+ Add'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {activeCategory?.items?.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                    <div className="text-5xl mb-3">🍽️</div>
                    <p>No items in this category yet</p>
                </div>
            )}
        </div>
    );
}
