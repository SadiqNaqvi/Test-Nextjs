self.addEventListener("push", (event) => {
  const { notification } = event.data.json();

  // const store = localforage.createInstance({ name: "Offline_Storage" });
  // store.setItem("new", true, () => console.log("Saved Successfully"));

  event.waitUntil(
    self.registration.showNotification(notification.title, notification)
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();

  e.waitUntil(clients.openWindow("/chat"));
});
