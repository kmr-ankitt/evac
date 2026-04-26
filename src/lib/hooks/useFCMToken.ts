"use client";

import { useEffect, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';

export const useFCMToken = () => {
  const { currentUser } = useAuth();
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !currentUser) return;

    const register = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        const vapidKey = process.env.NEXT_PUBLIC_VAPID_KEY;
        if (!vapidKey || vapidKey.length < 80) return;

        // Dynamically import to avoid SSR issues
        const { getMessaging, getToken } = await import('firebase/messaging');
        const { getApp } = await import('firebase/app');

        const messaging = getMessaging(getApp());
        const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: swReg });

        if (token) {
          setFcmToken(token);
          await updateDoc(doc(db, 'staff', currentUser.uid), { fcmToken: token });
        }
      } catch {
        // FCM is non-critical — silently ignore push service errors
      }
    };

    register();
  }, [currentUser]);

  return fcmToken;
};
