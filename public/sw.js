self.addEventListener('install', e=> self.skipWaiting());
self.addEventListener('activate', e=> self.clients.claim());
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : { title: "Hub Station", body: "Reminder" };
  event.waitUntil(self.registration.showNotification(data.title || "Hub Station", {
    body: data.body || data.title,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: { url: "/todo" },
    actions: [{ action: "done", title: "Done" }, { action: "snooze", title: "Snooze 10m" }]
  }));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if(event.action==="done"){
    // mark done via client - stub
  }
  event.waitUntil(clients.openWindow("/todo"));
});
