import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export function useKitchenSocket({ onNewOrder, onOrderUpdated, soundEnabled = false }) {
  const socketRef = useRef(null);
  const audioRef = useRef(null);

  function getAudio() {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = 'auto';
      audioRef.current = audio;
    }

    return audioRef.current;
  }

  async function playNotificationSound() {
    const audio = getAudio();
    const sources = ['/notification.mp3', '/notifiation.mp3'];

    for (const src of sources) {
      try {
        audio.pause();
        audio.src = src;
        audio.load();
        audio.currentTime = 0;
        await audio.play();
        return true;
      } catch {
        continue;
      }
    }

    return false;
  }

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
