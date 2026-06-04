import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export function useKitchenSocket({ onNewOrder, onOrderUpdated, soundEnabled = false }) {
  const socketRef = useRef(null);
  const audioRef = useRef(null);

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
        const tryPlay = async (src) => {
          const audio = new Audio(src);
          audio.preload = 'auto';
          audio.currentTime = 0;
          await audio.play();
        };

        const playWithFallback = async () => {
          const sources = ['/notification.mp3', '/notifiation.mp3'];

          for (const src of sources) {
            try {
              if (!audioRef.current || audioRef.current.src !== new URL(src, window.location.origin).href) {
                audioRef.current = new Audio(src);
                audioRef.current.preload = 'auto';
              }

              audioRef.current.currentTime = 0;
              await audioRef.current.play();
              return;
            } catch {
              continue;
            }
          }

          for (const src of sources) {
            try {
              await tryPlay(src);
              return;
            } catch {
              continue;
            }
          }
        };

        playWithFallback().catch(() => {});
      }
    });

    socket.on('order_updated', (order) => {
      onOrderUpdated?.(order);
    });

    return () => socket.disconnect();
  }, [onNewOrder, onOrderUpdated, soundEnabled]);

  return socketRef;
}
