export interface ChatThread {
  id: number;
  type: "direct" | "group";
  name?: string | null;
  owner_id?: number | null;
  group_id?: number | null;
  course_id?: number | null;
  created_at: string;
  updated_at: string;
  participants: ChatParticipant[];
  group?: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface ChatParticipant {
  id: number;
  thread_id: number;
  user_id: number;
  last_read_at: string | null;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    avatar?: string | null;
  };
}

export interface ChatMessage {
  id: number;
  thread_id: number;
  user_id: number;
  content: string | null;
  attachments: string[] | null;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    avatar?: string | null;
  };
  reactions?: Reaction[];
}

export interface Reaction {
  id: number;
  user_id: number;
  reaction_type: string;
  user?: {
    id: number;
    name: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface SendMessageRequest {
  content?: string;
  attachments?: string[];
}

export interface MessagesQueryParams {
  limit?: number;
  page?: number;
}

export interface TypingUser {
  userId: number;
  userName: string;
  timestamp: number;
}