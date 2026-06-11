import { messaging, getToken, onMessage } from "../firebase/firebase";
import { apiRequest } from "@/core/api/client";
import { toast } from "sonner";

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || "BEng2ZlFVgB0s_oy3JVAK7wIUEzJ-hLlGuR5W95F0TcmX1XuUOz5xmNu2kR7xG9AzxcvZqxt1B7W8J6y1PQtojY";

// Deduplication cache
const processedNotifications = new Set();

export const showNotificationToast = (payload, navigate) => {
  console.log("[DEBUG FCM] showNotificationToast received payload:", payload);
  
  const notificationId = payload.data?.notificationId || payload.messageId;
  if (notificationId && processedNotifications.has(notificationId)) {
    console.log("[DEBUG FCM] Duplicate notification detected, skipping toast:", notificationId);
    return;
  }
  if (notificationId) {
    processedNotifications.add(notificationId);
    // Keep cache small
    if (processedNotifications.size > 50) {
      const firstItem = processedNotifications.values().next().value;
      processedNotifications.delete(firstItem);
    }
  }

  const title = payload.notification?.title || payload.data?.title || "New Notification";
  const body = payload.notification?.body || payload.data?.body || "";
  const type = payload.data?.type || "";
  const route = payload.data?.route || "";

  // Play notification sound
  try {
    const audio = new Audio('/notification.mp3');
    audio.play().catch(e => console.log('Autoplay prevented or sound file missing'));
  } catch (e) {
    console.error('Audio error:', e);
  }

  const navigateTo = () => {
    if (route) {
      navigate(route);
    } else {
      switch (type) {
        case 'leave':
        case 'LEAVE_APPROVED':
        case 'LEAVE_REJECTED':
          navigate('/leave');
          break;
        case 'task':
        case 'TASK_ASSIGNED':
          navigate('/tasks');
          break;
        case 'feedback':
        case 'FEEDBACK_RECEIVED':
          navigate('/feedback');
          break;
        case 'proxy':
        case 'PROXY_ASSIGNED':
          navigate('/leave');
          break;
        default:
          break;
      }
    }
  };

  const options = {
    description: body,
    action: {
      label: 'View',
      onClick: navigateTo,
    },
  };

  if (title?.toLowerCase().includes('approved')) {
    toast.success(title, options);
  } else if (title?.toLowerCase().includes('rejected')) {
    toast.error(title, options);
  } else {
    toast(title, options);
  }
};

export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.log("This browser does not support desktop notification");
    return;
  }

  // Explicitly register service worker to enable background notifications
  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log("Service Worker registered successfully for FCM.");
    } catch (err) {
      console.error("Service worker registration failed:", err);
    }
  }

  // Safe wrapper to avoid repeated prompts
  if (Notification.permission !== "granted") {
    if (Notification.permission === "denied") {
      console.log("Notification permission already denied.");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        console.log("Notification permission granted.");
        await generateAndSaveToken();
      }
    } catch (error) {
      console.error("An error occurred while requesting permission. ", error);
    }
  } else {
    // Permission already granted, just ensure token is current
    await generateAndSaveToken();
  }
};

const generateAndSaveToken = async () => {
  try {
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (token) {
      console.log("FCM Token generated successfully.");
      await saveTokenToBackend(token);
    }
  } catch (error) {
    console.error("An error occurred while retrieving token. ", error);
  }
};

const saveTokenToBackend = async (fcmToken) => {
  // Prevent redundant saves (optional but good for production)
  if (localStorage.getItem('last_fcm_token') === fcmToken) return;

  try {
    await apiRequest("/users/save-fcm-token", {
      method: "POST",
      body: JSON.stringify({ fcmToken }),
    });
    localStorage.setItem('last_fcm_token', fcmToken);
    console.log("FCM token saved to backend.");
  } catch (error) {
    console.error("Error saving FCM token to backend:", error);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("Foreground message received:", payload);
      resolve(payload);
    });
  });
