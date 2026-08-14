import { useState, useEffect, useRef } from 'react';
import { getOrder } from '../api/endpoints';


export function useOrderStatus(orderId) {

    const [order, setOrder] = useState(null);
    
    const intervalRef = useRef(null);

    const TERMINAL = ['DELIVERED','PICKED_UP','CANCELLED'];

    useEffect(() => {

        if (!orderId) return;

        const fetchOrder = async () => {

            try {

                const { data } = await getOrder(orderId);

                setOrder(data.data);

                if (TERMINAL.includes(data.data.status))

                clearInterval(intervalRef.current);

            }
             catch (e) {
                console.error('Polling error:', e); 
            }
        };

        fetchOrder();

        intervalRef.current = setInterval(fetchOrder, 5000);

        return () => clearInterval(intervalRef.current);

    }, [orderId]);

    return { order };
    
}