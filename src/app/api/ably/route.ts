import { getAblyRest } from "@/app/chat/utils";
import Ably from "ably";
import { NextRequest, NextResponse } from "next/server";

export const revalidate = 0;

export const GET = async (r: NextRequest) => {
  try {
    const clientId = r.nextUrl.searchParams.get("clientId");
    if (!clientId) return Response.json("Unauthorized", { status: 401 });
    const client = getAblyRest();
    const tokenRequestData = await client.auth.createTokenRequest({ clientId });
    return NextResponse.json(tokenRequestData, { status: 200 });
  } catch (e: any) {
    return NextResponse.json("Something went wrong", { status: 500 });
  }
};

const participants = [
  "redpool08",
  "redpool0869",
  "test-user1",
  "test-user2",
  "test-user3",
  "test-user4",
  "test-user5",
];

type Notification = {
  title: string;
  body: string;
  icon: string; //(Src) Main icon that has to be shown in the notification.
  badge: string; // (Src) Small icon that is shown in the notification bar.
  sound: "default" | string; // (Src) Sound to be played
  priority: "high" | "normal";
  ttl: string; // ISO 8601,
  collapseKey: string;
};

type PushNotificationPayload = {
  notification: Notification;
  data: Record<string, any>;
  android: {
    notifiction: Notification;
    collapse_key: string; // Used in notification grouping. New Notification with same collape key might replace old one.
    priority: "high" | "low";
    time_to_live: string; // Date string
  };
  ios: {
    alert: Notification;
    badge: string;
    sound: string;
    "content-available": 1 | undefined; // Used to fetch data in the background
    category: string;
  };
  fcm: {
    data: Record<any, unknown>; // Can pass custom data
    proirity: "high" | "normal";
  };
  apns: {
    aps: {
      alert: { title: string; body: string; sound: string };
      "thread-id": string;
      "conent-available": 1 | undefined;
      "apns-headers": {
        "apns-push-type": "background";
        "apns-priority": "5";
      };
    };
  };
  tags: string[]; //Grouping of notification - do not trigger a new noti. if already exists with the same tag only update it.
  time_to_live: string;
  scheduled_at: string; //Date string to schedule notification in future.
  push_time: string; // Date string
};

export const POST = async () => {
  try {
    const ably = getAblyRest();
    await Promise.all(
      participants.map(async (clientId) => {
        const title = `${clientId}! You've recieved a new message`;
        const body = "Click here to open";
        return ably.push.admin.publish(
          { clientId },
          {
            notification: {
              title,
              body,
              priority: "high",
              icon: "/android-chrome-192x192.png",
              collapseKey: clientId,
            },
            fcm: {
              notification: {
                title: `${clientId}! You've recieved a new message`,
                body: "Click here to open",
                priority: "high",
                icon: "/android-chrome-192x192.png",
                color: "red",
              },
            },
            web: {
              badge: "/apple-touch-icon.png",
              renotify: true,
              silent: false,
              vibrate: [200, 100, 200],
              ttl: 86400,
              tag: clientId,
              priority: "high",
            },
          }
        );
      })
    );

    return new Response("Success", { status: 200 });
  } catch (err: any) {
    return new Response(err.message, { status: 500 });
  }
};
