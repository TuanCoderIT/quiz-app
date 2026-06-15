import { useCallback, useEffect, useRef, useState } from "react";
import {
  getGroupThread,
  getMessages,
  markAsRead,
  sendMessage,
  sendTyping,
} from "../chat.api";
import { getChatPusher } from "../chat.realtime";
import { ChatMessage, ChatThread, TypingUser } from "../chat.types";

type TypingEvent = {
  userId?: number | string;
  userName?: string;
  user_id?: number | string;
  user_name?: string;
  user?: {
    id?: number | string;
    name?: string;
  };
};

const TYPING_EVENTS = [
  "user.typing",
  ".user.typing",
  "UserTyping",
  "App\\Events\\UserTyping",
];

function parseTypingUser(event: TypingEvent): TypingUser | null {
  const rawUserId = event.userId ?? event.user_id ?? event.user?.id;
  const userName = event.userName ?? event.user_name ?? event.user?.name;
  const userId = Number(rawUserId);

  if (!Number.isFinite(userId) || !userName) return null;

  return {
    userId,
    userName,
    timestamp: Date.now(),
  };
}

export function useGroupChat(groupId?: number, currentUserId?: number) {
  const [thread, setThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const typingTimeoutsRef = useRef(
    new Map<number, ReturnType<typeof setTimeout>>(),
  );
  const lastTypingTimeRef = useRef(0);

  const loadChat = useCallback(async () => {
    if (!groupId) return;

    try {
      setLoading(true);

      const groupThread = await getGroupThread(groupId);
      setThread(groupThread);

      const messageResponse = await getMessages(groupThread.id, {
        limit: 30,
        page: 1,
      });

    //   setMessages([...messageResponse.data].reverse());
    setMessages(messageResponse.data);
      await markAsRead(groupThread.id);
    } catch (error) {
      console.log("Load group chat error:", error);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    loadChat();
  }, [loadChat]);

  useEffect(() => {
    if (!thread) return;

    const pusher = getChatPusher();
    if (!pusher) return;

    const channelName = `private-chat.thread.${thread.id}`;
    const channel = pusher.subscribe(channelName);
    const typingTimeouts = typingTimeoutsRef.current;

    channel.bind("pusher:subscription_succeeded", () => {
      console.log("Subscribed:", channelName);
    });

    channel.bind("pusher:subscription_error", (error: unknown) => {
      console.log("Subscription error:", error);
    });

    channel.bind("message.created", (event: { message: ChatMessage }) => {
      setMessages((prev) => {
        const exists = prev.some((msg) => msg.id === event.message.id);
        if (exists) return prev;
        return [...prev, event.message];
      });

      markAsRead(thread.id).catch(console.log);
    });

    const handleUserTyping = (event: TypingEvent) => {
      const typingUser = parseTypingUser(event);

      if (!typingUser) {
        console.log("Invalid user.typing payload:", event);
        return;
      }

      if (typingUser.userId === currentUserId) return;

      setTypingUsers((prev) => {
        const filtered = prev.filter(
          (user) => user.userId !== typingUser.userId,
        );
        return [...filtered, typingUser];
      });

      const existingTimeout = typingTimeouts.get(typingUser.userId);
      if (existingTimeout) clearTimeout(existingTimeout);

      const timeout = setTimeout(() => {
        setTypingUsers((prev) =>
          prev.filter((user) => user.userId !== typingUser.userId),
        );
        typingTimeouts.delete(typingUser.userId);
      }, 3000);

      typingTimeouts.set(typingUser.userId, timeout);
    };

    TYPING_EVENTS.forEach((eventName) => {
      channel.bind(eventName, handleUserTyping);
    });

    return () => {
      channel.unbind("message.created");
      TYPING_EVENTS.forEach((eventName) => {
        channel.unbind(eventName, handleUserTyping);
      });
      typingTimeouts.forEach(clearTimeout);
      typingTimeouts.clear();
      setTypingUsers([]);
      pusher.unsubscribe(channelName);
    };
  }, [thread, currentUserId]);

  const handleSendMessage = async (content: string) => {
    if (!thread || !content.trim()) return;

    try {
      setSending(true);

      await sendMessage(thread.id, {
        content: content.trim(),
      });
    } finally {
      setSending(false);
    }
  };

  const handleTyping = async () => {
    if (!thread) return;

    const now = Date.now();

    if (now - lastTypingTimeRef.current < 2000) {
      return;
    }

    lastTypingTimeRef.current = now;

    sendTyping(thread.id).catch(console.log);
  };

  return {
    thread,
    messages,
    typingUsers,
    loading,
    sending,
    sendMessage: handleSendMessage,
    sendTyping: handleTyping,
    reload: loadChat,
  };
}
