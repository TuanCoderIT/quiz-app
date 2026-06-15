import { useAuthStore } from "@/src/features/auth/store";
import PusherPackage from "pusher-js";

const API_URL = process.env.EXPO_PUBLIC_API_URL!;
const SERVER_URL = API_URL.replace("/api", "");

const PusherConstructor =
  (PusherPackage as any).Pusher ??
  (PusherPackage as any).default ??
  PusherPackage;

let pusherInstance: any = null;

export function getChatPusher() {
  const token = useAuthStore.getState().token;

  if (!token) {
    console.log("No token found for Reverb");
    return null;
  }

  if (pusherInstance) {
    return pusherInstance;
  }

  const key = process.env.EXPO_PUBLIC_REVERB_APP_KEY!;
  const host = process.env.EXPO_PUBLIC_REVERB_HOST!;
  const port = Number(process.env.EXPO_PUBLIC_REVERB_PORT ?? 8080);
  const scheme = process.env.EXPO_PUBLIC_REVERB_SCHEME ?? "http";
  const useTLS = scheme === "https";

  console.log("Pusher constructor:", PusherConstructor);
  console.log("Reverb config:", { key, host, port, scheme });

  pusherInstance = new PusherConstructor(key, {
    wsHost: host,
    wsPort: port,
    wssPort: port,
    forceTLS: useTLS,
    enabledTransports: useTLS ? ["wss"] : ["ws"],
    cluster: "mt1",
    authEndpoint: `${SERVER_URL}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    },
  });

  pusherInstance.connection.bind("connected", () => {
    console.log("Reverb connected");
  });

  pusherInstance.connection.bind("error", (error: unknown) => {
    console.log("Reverb error:", error);
  });

  return pusherInstance;
}

export function disconnectChatPusher() {
  pusherInstance?.disconnect?.();
  pusherInstance = null;
}
