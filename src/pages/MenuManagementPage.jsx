import { useState, useEffect } from 'react';
import {
    getMenuAdmin, createMenuItem, updateMenuItem,
    toggleAvailability, getCategories, creatCategory
} from '../api/endpoints';

const EMPTY_FORM = { name: '', description: '', price: '', category_id: '', image_url: '' };

export default function MenuManagementPage() {
    const [menu, setMenu] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(EMPTY_FORM);
    const [editingId, setEditingId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [togglingId, setTogglingId] = useState(null);
    const [newCat, setNewCat] = useState('');
    const [addingCat, setAddingCat] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchAll = async () => {
        try {
            const [menuRes, catRes] = await Promise.all([getMenuAdmin(), getCategories()]);
            setMenu(menuRes.data.data || []);
            setCategories(catRes.data.data || []);
        } catch {
            setMenu([]); setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };

    const handleEdit = (item) => {
        const id = item.ID ?? item.id;
        setForm({
            name: item.name,
            description: item.description || '',
            price: item.price,
            category_id: item.category_id,
            image_url: item.image_url || '',
        });
        setEditingId(id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setForm(EMPTY_FORM);
        setEditingId(null);
        setShowForm(false);
        setError('');
    };

    const handleSubmit = async () => {
        if (!form.name || !form.price || !form.category_id) {
            setError('Name, price, and category are required.'); return;
        }
        setError(''); setSubmitting(true);
        try {
            if (editingId) {
                await updateMenuItem(editingId, form);
                showSuccess('Item updated!');
            } else {
                await createMenuItem(form);
                showSuccess('Item added!');
            }
            handleCancel();
            await fetchAll();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save item');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggle = async (itemId) => {
        setTogglingId(itemId);
        try {
            await toggleAvailability(itemId);
            await fetchAll();
        } catch {
            alert('Could not toggle availability');
        } finally {
            setTogglingId(null);
        }
    };

    const handleAddCategory = async () => {
        if (!newCat.trim()) return;
        setAddingCat(true);
        try {
            await creatCategory({ name: newCat.trim() });
            setNewCat('');
            await fetchAll();
            showSuccess('Category added!');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add category');
        } finally {
            setAddingCat(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="text-center">
                <div className="animate-spin text-4xl mb-3">🍳</div>
                <p className="text-gray-500">Loading...</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-extrabold text-gray-900">Menu Management 🍽️</h1>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:brightness-110"
                    >
                        + Add Item
                    </button>
                )}
            </div>

            {/* Success/Error */}
            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm font-medium">
                    ✅ {success}
                </div>
            )}

            {/* Item Form */}
            {showForm && (
                <div className="mb-6 rounded-3xl border border-violet-100 bg-white p-6 shadow-sm">
                    <h2 className="font-bold text-gray-900 mb-4">{editingId ? 'Edit Item' : 'Add New Item'}</h2>
                    {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Name *</label>
                            <input
                                value={form.name}
                                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                placeholder="e.g. Jollof Rice"
                                className="w-full rounded-2xl border border-violet-100 bg-violet-50/40 px-3 py-2 text-sm transition-all duration-200 focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Price (₦) *</label>
                            <input
                                type="number"
                                value={form.price}
                                onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                                placeholder="e.g. 2500"
                                className="w-full rounded-2xl border border-violet-100 bg-violet-50/40 px-3 py-2 text-sm transition-all duration-200 focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Category *</label>
                            <select
                                value={form.category_id}
                                onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}
                                className="w-full rounded-2xl border border-violet-100 bg-violet-50/40 px-3 py-2 text-sm transition-all duration-200 focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100"
                            >
                                <option value="">Select category</option>
                                {categories.map(c => {
                                    const cid = c.ID ?? c.id;
                                    return <option key={cid} value={cid}>{c.name}</option>;
                                })}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Image URL</label>
                            <input
                                value={form.image_url}
                                onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))}
                                placeholder="https://..."
                                className="w-full rounded-2xl border border-violet-100 bg-violet-50/40 px-3 py-2 text-sm transition-all duration-200 focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
                            <textarea
                                value={form.description}
                                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                placeholder="Brief description of the dish..."
                                rows={2}
                                className="w-full resize-none rounded-2xl border border-violet-100 bg-violet-50/40 px-3 py-2 text-sm transition-all duration-200 focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 px-5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 disabled:opacity-50"
                        >
                            {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Add Item'}
                        </button>
                        <button
                            onClick={handleCancel}
                            className="border border-gray-200 text-gray-600 px-5 py-2 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Add Category */}
            <div className="mb-6 rounded-3xl border border-violet-100 bg-white p-5 shadow-sm">
                <h2 className="font-bold text-gray-900 mb-3">Categories</h2>
                <div className="flex flex-wrap gap-2 mb-3">
                    {categories.map(c => (
                        <span key={c.ID ?? c.id} className="rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700">
                            {c.name}
                        </span>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input
                        value={newCat}
                        onChange={e => setNewCat(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                        placeholder="New category name"
                        className="flex-1 rounded-2xl border border-violet-100 bg-violet-50/40 px-3 py-2 text-sm transition-all duration-200 focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100"
                    />
                    <button
                        onClick={handleAddCategory}
                        disabled={addingCat || !newCat.trim()}
                        className="rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 disabled:opacity-50"
                    >
                        {addingCat ? '...' : '+ Add'}
                    </button>
                </div>
            </div>

            {/* Menu Items */}
            {menu.map(category => {
                const catId = category.ID ?? category.id;
                return (
                    <div key={catId} className="mb-6">
                        <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide mb-3">
                            {category.name}
                        </h2>
                        <div className="space-y-2">
                            {category.items?.map(item => {
                                const id = item.ID ?? item.id;
                                return (
                                    <div
                                        key={id}
                                        className={`flex items-center gap-4 rounded-2xl border border-violet-100 bg-white p-4 shadow-sm transition-all duration-200 ${
                                            togglingId === id ? 'opacity-50' : 'hover:shadow-md'
                                        }`}
                                    >
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.name} className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
                                        ) : (
                                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-pink-100 text-xl">🍽️</div>
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                                            <p className="bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-sm font-bold text-transparent">
                                                ₦{Number(item.price).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleToggle(id)}
                                                disabled={!!togglingId}
                                                className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-colors ${
                                                    item.is_available
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                }`}
                                            >
                                                {item.is_available ? '✓ Available' : '✗ Unavailable'}
                                            </button>
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="text-xs px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 font-semibold hover:bg-blue-100 transition-colors"
                                            >
                                                Edit
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                            {!category.items?.length && (
                                <p className="text-gray-400 text-sm italic pl-2">No items in this category</p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}