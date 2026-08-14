import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
    const { user, logout, isStaff } = useAuth();
    const { itemCount } = useCart();
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const navLink = (to, label) => (
        <Link
            to={to}
            className={`text-sm font-medium transition-all duration-200 ${
                isActive(to)
                    ? 'text-white underline underline-offset-4'
                    : 'text-purple-100 hover:text-white'
            }`}
        >
            {label}
        </Link>
    );

    return (
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-gradient-to-r from-violet-700 via-fuchsia-600 to-pink-500 text-white shadow-lg shadow-violet-900/10">
            <div className="max-w-6xl mx-auto flex justify-between items-center h-16 px-4 sm:px-6">
                <Link to="/" className="flex items-center gap-2 font-extrabold text-xl tracking-tight transition-transform hover:scale-[1.02]">
                    <span className="text-2xl">🍔</span>
                    <span>FoodDash</span>
                </Link>

                <div className="flex items-center gap-5">
                    {navLink('/', 'Menu')}

                    {isStaff && (
                        <>
                            {navLink('/staff', 'Orders')}
                            {navLink('/staff/menu', 'Menu Mgmt')}
                        </>
                    )}

                    {user && !isStaff && (
                        <>
                            <Link
                                to="/cart"
                                className={`relative text-sm font-medium transition-all duration-200 ${
                                    isActive('/cart') ? 'text-white underline underline-offset-4' : 'text-purple-100 hover:text-white'
                                }`}
                            >
                                🛒 Cart
                                {itemCount > 0 && (
                                    <span className="absolute -top-2 -right-4 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg shadow-pink-500/30">
                                        {itemCount}
                                    </span>
                                )}
                            </Link>
                            {navLink('/orders', 'My Orders')}
                        </>
                    )}

                    {user ? (
                        <div className="flex items-center gap-3 ml-2">
                            <span className="text-purple-100 text-sm hidden sm:block">
                                Hi, {user.name?.split(' ')[0]}
                            </span>
                            <button
                                onClick={() => { logout(); navigate('/'); }}
                                className="rounded-lg bg-white/15 px-3 py-1.5 text-sm font-medium text-white transition-all duration-200 hover:bg-white/25"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="rounded-lg bg-white px-4 py-1.5 text-sm font-semibold text-violet-700 transition-all duration-200 hover:bg-violet-50"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
