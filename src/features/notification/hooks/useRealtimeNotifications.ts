import { getChatPusher } from "@/src/features/chat/chat.realtime";
import { useEffect } from "react";
import { useNotificationStore } from "../store";
import { AppNotification } from "../types";

type NotificationCreatedPayload = {
  notification: AppNotification;
  unread_count: number;
};

export function useRealtimeNotifications(userId?: number | null) {
  const addRealtimeNotification = useNotificationStore(
    (state) => state.addRealtimeNotification,
  );

  useEffect(() => {
    if (!userId) return;

    const pusher = getChatPusher();

    if (!pusher) return;

    const channelName = `private-notifications.${userId}`;

    const channel = pusher.subscribe(channelName);

    channel.bind(
      "notification.created",
      (payload: NotificationCreatedPayload) => {
        console.log("Realtime notification:", payload);
        addRealtimeNotification(payload);
      },
    );

    return () => {
      channel.unbind("notification.created");
      pusher.unsubscribe(channelName);
    };
  }, [userId]);
}
