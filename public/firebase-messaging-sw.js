importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  // These will be overridden by the client URL parameters if we pass them, 
  // but it's often necessary to hardcode them or generate this file dynamically.
  // For standard V9+ compat, you need to provide your config here.
  // We'll instruct the user to replace these or they will fail. 
  // For hackathon purposes, standard is pasting the config here.
  // We will leave placeholders and note it in the file.
  apiKey: "AIzaSyCperkxm46dUXF1eXT3GZUh4YaODgvnDt4",
  authDomain: "evac-bfea6.firebaseapp.com",
  projectId: "evac-bfea6",
  messagingSenderId: "738961076952",
  appId: "1:738961076952:web:ea492ed517a30170c49dad"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || 'Emergency Alert';
  const notificationOptions = {
    body: payload.notification?.body,
    icon: '/icon-192.png' // We can just use a placeholder icon path
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
