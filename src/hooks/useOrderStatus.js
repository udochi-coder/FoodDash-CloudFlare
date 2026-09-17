import { useState, useEffect, useRef } from 'react';
import { getOrder } from '../api/endpoints';
import { orderWebSocketURL } from '../api/client';

const TERMINAL_STATUSES = new Set(['DELIVERED', 'PICKED_UP', 'CANCELLED']);

export function useOrderStatus(orderId) {

    const [order, setOrder] = useState(null);
    const [isLive, setIsLive] = useState(false);
    const refreshTimerRef = useRef(null);
    const reconnectTimerRef = useRef(null);

    useEffect(() => {

        if (!orderId) return;

        let disposed = false;
        let shouldReconnect = true;
        let socket;

        const fetchOrder = async () => {

            try {

                const { data } = await getOrder(orderId);

                if (disposed) return;

                setOrder(data.data);

                if (TERMINAL_STATUSES.has(data.data.status)) {
                    shouldReconnect = false;
                    clearInterval(refreshTimerRef.current);
                    socket?.close();
                }

            }
             catch (e) {
                if (!disposed) console.error('Order refresh failed:', e);
            }
        };

        const connect = () => {
            const token = localStorage.getItem('token');
            if (!token || disposed) return;

            socket = new WebSocket(orderWebSocketURL(orderId, token));

            socket.onopen = () => {
                if (!disposed) setIsLive(true);
            };

            socket.onmessage = event => {
                try {
                    const message = JSON.parse(event.data);
                    const nextOrder = message.data;
                    if (!nextOrder || disposed) return;

                    setOrder(nextOrder);
                    if (TERMINAL_STATUSES.has(nextOrder.status)) {
                        shouldReconnect = false;
                        clearInterval(refreshTimerRef.current);
                        socket.close();
                    }
                } catch {
                    // Ignore malformed messages and keep the HTTP fallback active.
                }
            };

            socket.onclose = () => {
                if (disposed || !shouldReconnect) return;
                setIsLive(false);
                reconnectTimerRef.current = setTimeout(connect, 5000);
            };
        };

        fetchOrder();
        connect();
        // This is a resilience fallback if a proxy temporarily drops WebSockets.
        refreshTimerRef.current = setInterval(fetchOrder, 30000);

        return () => {
            disposed = true;
            clearInterval(refreshTimerRef.current);
            clearTimeout(reconnectTimerRef.current);
            socket?.close();
        };

    }, [orderId]);

    return { order, isLive };
    
}
