import { createContext, useContext, useState, useEffect } from 'react';
import { getCart } from '../api/endpoints';
import { useAuth } from './AuthContext.jsx';


const CartContext = createContext(null);

export function CartProvider({ children }) {

    const { user }  = useAuth();
    const [cart, setCart] = useState(null);

    const itemCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

    const refreshCart = async () => {

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
    };

    useEffect(() => { refreshCart(); }, [user]);

    return (
        <CartContext.Provider value={{ cart, itemCount, refreshCart }}>
        {children}
        </CartContext.Provider>
    );
    
   
}

 export const useCart = () => useContext(CartContext);