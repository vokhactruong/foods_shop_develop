import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { playNotificationSound } from '../utils/notificationSound';

export function useKitchenSocket({ onNewOrder, onOrderUpdated, soundEnabled = false }) {
  const socketRef = useRef(null);
  const onNewOrderRef = useRef(onNewOrder);
  const onOrderUpdatedRef = useRef(onOrderUpdated);
  const soundEnabledRef = useRef(soundEnabled);

  useEffect(() => {
    onNewOrderRef.current = onNewOrder;
  }, [onNewOrder]);

  useEffect(() => {
    onOrderUpdatedRef.current = onOrderUpdated;
  }, [onOrderUpdated]);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

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

    const handleNewOrder = (order) => {
      onNewOrderRef.current?.(order);

      if (soundEnabledRef.current) {
        playNotificationSound().catch(() => {});
      }
    };

    const handleOrderUpdated = (order) => {
      onOrderUpdatedRef.current?.(order);
    };

    socket.on('new_order', handleNewOrder);
    socket.on('order_updated', handleOrderUpdated);

    return () => socket.disconnect();
  }, []);

  return socketRef;
}
