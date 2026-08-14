import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async e => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            await register(form.name, form.email, form.password);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[80vh] items-center justify-center py-10">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <div className="mb-3 text-5xl">🍽️</div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Create account</h1>
                    <p className="mt-1 text-gray-500">Join FoodDash and start ordering</p>
                </div>

                <div className="rounded-3xl border border-violet-100 bg-white/90 p-8 shadow-2xl shadow-violet-100 backdrop-blur">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                            <input
                                placeholder="John Doe"
                                value={form.name}
                                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                className="w-full rounded-2xl border border-violet-100 bg-violet-50/50 px-4 py-3 text-sm transition-all duration-200 focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                            <input
                                type="email"
                                placeholder="you@email.com"
                                value={form.email}
                                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                                className="w-full rounded-2xl border border-violet-100 bg-violet-50/50 px-4 py-3 text-sm transition-all duration-200 focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                            <input
                                type="password"
                                placeholder="Min. 8 characters"
                                value={form.password}
                                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                className="w-full rounded-2xl border border-violet-100 bg-violet-50/50 px-4 py-3 text-sm transition-all duration-200 focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100"
                                required
                                minLength={8}
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="mt-2 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 py-3 text-sm font-bold text-white transition-all duration-200 hover:brightness-110 disabled:opacity-50 active:scale-95"
                        >
                            {loading ? 'Creating account...' : 'Create Account →'}
                        </button>
                    </div>

                    <p className="text-center mt-6 text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-violet-600 hover:text-pink-500 hover:underline">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
