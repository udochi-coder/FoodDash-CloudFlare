import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCart } from '../api/endpoints';
import { useAuth } from './AuthContext.jsx';


const CartContext = createContext(null);

export function CartProvider({ children }) {

    const { user }  = useAuth();
    const [cart, setCart] = useState(null);

    const itemCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

    const refreshCart = useCallback(async () => {

        if (!user) {
             setCart(null); return;
        }

        try { 
            const { data } = await getCart(); 
            setCart(data.data); 
        }
        catch {
             setCart(null);
        }
    }, [user]);

    useEffect(() => { refreshCart(); }, [refreshCart]);

    return (
        <CartContext.Provider value={{ cart, itemCount, refreshCart }}>
        {children}
        </CartContext.Provider>
    );
    
   
}

// This hook intentionally lives beside its provider so consumers share one
// context instance. It is not a Fast Refresh component export.
// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);
