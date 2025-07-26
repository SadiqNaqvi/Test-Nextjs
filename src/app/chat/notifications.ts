"use client";

import Ably from "ably";
import Push from "ably/push";

export const checkPushStatus = () => {
  return Notification.permission;
};

export const enablePush = async (user_id: string) => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "denied") {
      alert("Notification Permission denied");
      return;
    }

    const client = new Ably.Realtime({
      authUrl: `${process.env.NEXT_PUBLIC_APP_ROOT}/api/ably`,
      pushServiceWorkerUrl: "/sw.js",
      clientId: user_id,
      plugins: { Push },
    });

    await client.push.activate();
    alert("Notification Enabled successfully");
  } catch (err: any) {
    alert(err.message);
  }
};

export const disablePush = (user_id: string) => {
  try {
    new Ably.Realtime({
      authUrl: `${process.env.NEXT_PUBLIC_APP_ROOT}/api/ably`,
      pushServiceWorkerUrl: "/sw.js",
      clientId: user_id,
      plugins: { Push },
    }).push
      .deactivate()
      .then(() => alert("UnRegistered successfully"));
  } catch (err: any) {
    alert(err.message);
  }
};
