import Ably, { Realtime, Rest } from "ably";

let ably_realtime: Realtime | null = null;
let ably_rest: Rest | null = null;
let ably_client: RealTime | null = null;

export const getAblyRealtime = () => {
  if (!ably_realtime)
    ably_realtime = new Ably.Realtime(process.env.ABLY_API_KEY!);
  return ably_realtime;
};

export const getAblyRest = () => {
  if (!ably_rest) ably_rest = new Ably.Rest(process.env.ABLY_API_KEY!);
  return ably_rest;
};

export const getAbly = (client_id: string) => {
  if (!ably_client) {
    ably_client = new Ably.Realtime({
      authUrl: `${process.env.NEXT_PUBLIC_APP_ROOT}/api/ably`,
      clientId: client_id,
    });
  }

  return ably_client;
};
