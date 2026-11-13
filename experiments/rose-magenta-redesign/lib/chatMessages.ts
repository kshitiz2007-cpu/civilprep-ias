import { supabase } from '@/lib/supabaseClient';

export interface ChatMessage {
  id: string | number;
  sender_id: string;
  receiver_id: string;
  content: string;
  image_url: string | null;
  is_read: boolean;
  created_at: string;
  imageSrc?: string | null;
}

export async function hydrateChatMessages(
  messages: ChatMessage[]
): Promise<ChatMessage[]> {
  return Promise.all(
    messages.map(async (message) => {
      if (!message.image_url) return { ...message, imageSrc: null };
      if (/^https?:\/\//i.test(message.image_url)) {
        return { ...message, imageSrc: message.image_url };
      }

      const { data, error } = await supabase.storage
        .from('chat-images')
        .createSignedUrl(message.image_url, 60 * 60);

      return { ...message, imageSrc: error ? null : data.signedUrl };
    })
  );
}

export function mergeChatMessage(
  messages: ChatMessage[],
  incoming: ChatMessage
): ChatMessage[] {
  const byId = new Map(messages.map((message) => [message.id, message]));
  byId.set(incoming.id, incoming);
  return [...byId.values()].sort(
    (left, right) =>
      new Date(left.created_at).getTime() - new Date(right.created_at).getTime()
  );
}
