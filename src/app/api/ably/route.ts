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
export const POST = async () => {
  try {
    const ably = getAblyRest();
    await Promise.all(
      participants.map(async (clientId) => {
        return ably.push.admin.publish(
          { clientId },
          {
            notification: {
              title: `${clientId}! You've recieved a new message`,
              // data: { path: "/chat" },
              body: "Click here to open",
              icon: "/public/next.svg",
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
