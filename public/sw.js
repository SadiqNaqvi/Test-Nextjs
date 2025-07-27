self.addEventListener("push", (event) => {
  const { notification } = event.data.json();

  event.waitUntil(
    self.registration.showNotification(notification.title, notification)
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();

  e.waitUntil(clients.openWindow("/chat"));
});
