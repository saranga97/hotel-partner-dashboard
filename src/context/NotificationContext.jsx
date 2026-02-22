import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import axiosInstance from "../api/axiosInstance";

const NotificationContext = createContext();

const STORAGE_KEY = "ceylonstay_notifications";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5001";

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const socketRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = useCallback((type, message, data = null) => {
    const notification = {
      id: Date.now().toString(),
      type,
      message,
      data,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [notification, ...prev]);
  }, []);

  // Socket.IO connection
  useEffect(() => {
    const token = localStorage.getItem("ceylonstay_token");
    if (!token) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      // Fetch hotels and join rooms
      axiosInstance
        .get("/hotels/my-hotels")
        .then((res) => {
          res.data.forEach((hotel) => {
            socket.emit("join_hotel", hotel._id);
          });
        })
        .catch((err) => console.error("Failed to join hotel rooms:", err));
    });

    socket.on("new_booking", (booking) => {
      const roomName = booking.room?.roomName || booking.room?.roomLabel || "Room";
      const guestName = booking.user?.fullName || "A guest";
      const price = booking.selectedPackage?.price?.toLocaleString() || "";
      addNotification(
        "new_booking",
        `New booking request: ${guestName} wants to book ${roomName} for ${booking.date} - LKR ${price}`,
        booking
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [addNotification]);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, markAsRead, clearAll, unreadCount }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
