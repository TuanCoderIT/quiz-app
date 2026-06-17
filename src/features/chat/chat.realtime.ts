import { useAuthStore } from "@/src/features/auth/store";
import Echo from "laravel-echo";
import PusherPackage from "pusher-js/react-native";

type ReverbEcho = Echo<"pusher">;
type PusherConstructor = new (
  key: string,
  options: Record<string, unknown>,
) => any;

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";
const SERVER_URL = API_URL.replace(/\/api\/?$/, "");
const PusherClient = (
  (PusherPackage as any).default ??
  (PusherPackage as any).Pusher ??
  PusherPackage
) as PusherConstructor;

let echoInstance: ReverbEcho | null = null;
let echoToken: string | null = null;

function getReverbConfig() {
  const key = process.env.EXPO_PUBLIC_REVERB_APP_KEY;
  const host = process.env.EXPO_PUBLIC_REVERB_HOST;
  const port = Number(process.env.EXPO_PUBLIC_REVERB_PORT || 8080);
  const scheme = process.env.EXPO_PUBLIC_REVERB_SCHEME || "http";
  const useTLS = scheme === "https";

  if (!key || !host) {
    console.warn("Reverb env is missing EXPO_PUBLIC_REVERB_APP_KEY or HOST");
  }

  return { key, host, port, scheme, useTLS };
}

function logConnectionEvents(echo: ReverbEcho) {
  const pusher = echo.connector.pusher;

  pusher.connection.bind("state_change", (states: unknown) => {
    console.log("Reverb state change:", states);
  });

  pusher.connection.bind("connected", () => {
    console.log("Reverb connected:", pusher.connection.socket_id);
  });

  pusher.connection.bind("error", (error: unknown) => {
    console.log("Reverb connection error:", error);
  });
}

export function getReverbEcho() {
  const token = useAuthStore.getState().token;

  if (echoInstance && echoToken === token) {
    return echoInstance;
  }

  echoInstance?.disconnect();

  const { key, host, port, scheme, useTLS } = getReverbConfig();

  (globalThis as any).Pusher = PusherClient;
  if (typeof window !== "undefined") {
    (window as any).Pusher = PusherClient;
  }

  console.log("Reverb config:", {
    key,
    host,
    port,
    scheme,
    authEndpoint: `${SERVER_URL}/broadcasting/auth`,
    hasToken: Boolean(token),
  });

  const echoOptions = {
    broadcaster: "pusher",
    Pusher: PusherClient,
    key,
    wsHost: host,
    wsPort: port,
    wssPort: port,
    forceTLS: useTLS,
    encrypted: useTLS,
    enabledTransports: useTLS ? ["wss"] : ["ws"],
    disableStats: true,
    cluster: "mt1",
    authEndpoint: `${SERVER_URL}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        Accept: "application/json",
      },
    },
  };

  echoInstance = new Echo(echoOptions as any) as ReverbEcho;

  echoToken = token;
  logConnectionEvents(echoInstance);

  return echoInstance;
}

export function getChatPusher() {
  return getReverbEcho().connector.pusher;
}

export function disconnectReverb() {
  echoInstance?.disconnect();
  echoInstance = null;
  echoToken = null;
}

export const disconnectChatPusher = disconnectReverb;
