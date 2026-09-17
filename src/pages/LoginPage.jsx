import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async e => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            const user = await login(form.email, form.password);
            navigate(user.role === 'staff' ? '/staff' : '/');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[80vh] items-center justify-center py-10">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <div className="mb-3 text-5xl">🍔</div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Welcome back!</h1>
                    <p className="mt-1 text-gray-500">Login to continue your order</p>
                </div>

                <form onSubmit={handleSubmit} className="rounded-3xl border border-violet-100 bg-white/90 p-8 shadow-2xl shadow-violet-100 backdrop-blur">
                    <div className="space-y-4">
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
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                    className="w-full rounded-2xl border border-violet-100 bg-violet-50/50 px-4 py-3 pr-12 text-sm transition-all duration-200 focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(value => !value)}
                                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-gray-400 hover:text-violet-600"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-2 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-pink-500 py-3 text-sm font-bold text-white transition-all duration-200 hover:brightness-110 disabled:opacity-50 active:scale-95"
                        >
                            {loading ? 'Logging in...' : 'Login →'}
                        </button>
                    </div>

                    <p className="text-center mt-6 text-sm text-gray-500">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-semibold text-violet-600 hover:text-pink-500 hover:underline">
                            Create one
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
