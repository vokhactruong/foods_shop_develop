import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { playNotificationSound } from '../utils/notificationSound';

export function useKitchenSocket({ onNewOrder, onOrderUpdated, soundEnabled = false }) {
  const socketRef = useRef(null);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL;
    const socket = io(socketUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_kitchen');
    });

    socket.on('new_order', (order) => {
      onNewOrder?.(order);

      if (soundEnabled) {
        playNotificationSound().catch(() => {});
      }
    });

    socket.on('order_updated', (order) => {
      onOrderUpdated?.(order);
    });

    return () => socket.disconnect();
  }, [onNewOrder, onOrderUpdated, soundEnabled]);

  return socketRef;
}
