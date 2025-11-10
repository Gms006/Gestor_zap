'use client';

import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const EVENTS = ['sync:start', 'sync:progress', 'sync:end', 'alerts:new', 'chat:incoming'];

export default function useWebSocket() {
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState([]);
  const lastEventRef = useRef(null);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000';
    const socket = io(socketUrl, {
      transports: ['websocket'],
    });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    EVENTS.forEach((event) => {
      socket.on(event, (payload) => {
        const wrapped = {
          type: event,
          payload,
          receivedAt: new Date().toISOString(),
        };
        lastEventRef.current = wrapped;
        setEvents((prev) => [...prev.slice(-49), wrapped]);
      });
    });

    return () => {
      EVENTS.forEach((event) => socket.off(event));
      socket.disconnect();
    };
  }, []);

  return { connected, lastEvent: lastEventRef.current, events };
}
