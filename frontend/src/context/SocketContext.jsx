import { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect to Socket.io server
      const newSocket = io(import.meta.env.VITE_BACKEND_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('🔌 Connected to Socket.io server');
        // Join with user ID
        newSocket.emit('join', user.id);
      });

      newSocket.on('disconnect', () => {
        console.log('🔌 Disconnected from Socket.io server');
      });

      // Listen for hire notification
      newSocket.on('hired', (data) => {
        console.log('🎉 Hired notification received:', data);
        
        // Add to notifications
        const notification = {
          id: Date.now(),
          type: 'hired',
          ...data,
          timestamp: new Date()
        };
        setNotifications(prev => [notification, ...prev]);

        // Show browser notification
        showNotification(data);

        // Play sound (optional)
        playNotificationSound();
      });

      // Listen for new bid notification (for gig owners)
      newSocket.on('new_bid', (data) => {
        console.log('📬 New bid notification received:', data);
        
        const notification = {
          id: Date.now(),
          type: 'new_bid',
          ...data,
          timestamp: new Date()
        };
        setNotifications(prev => [notification, ...prev]);
        
        showNotification(data);
        playNotificationSound();
      });

      // Listen for bid rejection
      newSocket.on('bid_rejected', (data) => {
        console.log('❌ Bid rejected notification received:', data);
        
        const notification = {
          id: Date.now(),
          type: 'rejected',
          ...data,
          timestamp: new Date()
        };
        setNotifications(prev => [notification, ...prev]);
      });

      setSocket(newSocket);

      // Cleanup
      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user]);

  // Show browser notification
  const showNotification = (data) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('GigFlow Notification', {
        body: data.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }
  };

  // Play notification sound
  const playNotificationSound = () => {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAU+ltryxnMpBSuAzvLaizsIGGS57OihUBELTKXh8bllHAU2jtLz0H4xBSF1xe/glEcOD1Op5O+zYBkFPJPY8stvKAUuf8zx3I4+CBlpuuztolQSC0yn4vGzZBwFN4/R89F+MAUjdcXv45ZHDg5UquPvtWAdBUKX2O+9cCkFLoHM8dmNOwgZbbvs7aVUD0yt4/G2ZRwGOJDR8M99LwUhd8Xv35RGDg9TquPvs2AdBUGZ1++9cCgFL37M8dmNOwgab7zs7qVUD0yv5PG3ZRwGOI/R8M9+LwUhdsXv3pNGDg9Ure/vs2AcBUCZ1/C9bygFLX/M8NiOOwgacLzs7qVUD02v5PG3ZRsGOI/R8M59LgUgd8Xv3pNFDg5Ure/vs2AcBT+Y1/C9bycFL3/M8NiOOggacbzs7qZTE0ut5PG4ZRsGOI/R8M58LgUgdsXv3pNFDg5TrO/vs18cBT+Y1/C9bycFMH/N8NiOOggab7zs7qZTE0uu5PG4ZBoGOI/R8M58LgUfdsXv35NEDg5TrO/vs18cBT+Y1/C8bycFMH/N8NmOOQgab7vt76dSE0uu5PG5ZBoGOI/R8M58LQUfdsXv35RFDg5TrO/vtF8cBT+X1/G8bycFMIHN8NmOOQgabbrs76dSE0qv5PG5ZBoGN4/R8M18LQUfdsXv3pNFDg5TrO/vtF4cBT+Y1/G8bycFMIDN8NmPOQgabLrs76dTE0qv5PG4ZRoGN4/R8M18LQUedsXv3pNEDg9Uq+/vtV4cBT+X1/C9bycFMIDN8NmPOQgabrvt76dTE0qu5PG4ZBoHN4/R8M18LQUedsXv3pNEDg9Uq+/vtV4cBUCY1/C9bycFL4DO8NmPOQgabLvt76dTE0qu5PG5ZRoHN4/R8M18LQUedcTv3pNEDg9Uq+/vtV4cBUCY1/C9bycFL4DO8NmPOQgabLvt7qdTE0qu5PG4ZRoGN4/R8M58LQUedsXv35NFDg9UquDvtl8cBUCY1/C9bycFL4DN8diOOQgabLrs76hSE0qu5PG4ZRoGN4/R8M98LgUfdsXv35NFDg9Ure/vs2AcBT+Y1/C9bycFLoHM8diNOQgbbrvs76dTE0uv5PG5ZBoGOI/R8M9+LwUhdsXv35RGDg5Ure/vs2AdBT6Z1++9cCkFL4HN8NiOOwgab7zs7qZTE0yv5PG3ZRwGOJDR8NB+MAUgd8Xv4JRHDg5Ure/vsmAdBT+Z1/C9cCgFMH/M8NiOOwgZb7zs7aVUE0ut5fG2ZRwGOI/R8M9+LwUgd8Xv3pNGDg9TquPvs2AdBT+Z1/C9bygFL37M8dmNOwgZb7zs7aVUD0ut4/G2ZRwGOJDR8M9+LwUgdsXv3pNGDg9TquPvs2AdBUGY1/C9bygFLn7M8NmNOggZbbvs7aZUD0us5PG2ZRwGOJDR8M9+LwUgd8Xv3pNGDg9Tq+Pvs2AdBT+Y1/C9bykFL37M8NiOOwgZbbvs7aVUD0us5PG2ZRwGOJDR8M9+LwUgd8Xv3pNFDg9Tq+Pvs2AcBT+Z1/C9bykFL37L8NiNOggZbbvs7qZUD0us5PG2ZRsGOJDR8M99LwUhd8Xv3pNFDg9Tq+Pv');
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Remove notification
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  const value = {
    socket,
    notifications,
    removeNotification,
    clearNotifications
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};