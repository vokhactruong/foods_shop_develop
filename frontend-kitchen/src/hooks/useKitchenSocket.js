import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export function useKitchenSocket({ onNewOrder, onOrderUpdated }) {
  const socketRef = useRef(null);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL;
    const socket = io(socketUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_kitchen');
    });

    socket.on('new_order', (order) => {
      onNewOrder?.(order);
      // Âm thanh thông báo
      try { new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAA...').play(); } catch {}
    });

    socket.on('order_updated', (order) => {
      onOrderUpdated?.(order);
    });

    return () => socket.disconnect();
  }, []);

  return socketRef;
}
