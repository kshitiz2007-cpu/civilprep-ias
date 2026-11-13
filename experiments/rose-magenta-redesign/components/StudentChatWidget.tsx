'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { MessageCircle, X, Send, Image as ImageIcon, Loader2 } from 'lucide-react';
import { ChatMessage, hydrateChatMessages, mergeChatMessage } from '@/lib/chatMessages';

interface StudentChatUser {
  id: string;
  name?: string | null;
  email?: string | null;
}

export default function StudentChatWidget({
  user,
}: {
  user: StudentChatUser | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [adminId, setAdminId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user?.id || user.id === 'demo_user') return;
    const userId = user.id;
    let active = true;

    async function loadConversation() {
      setIsLoading(true);
      setErrorMessage(null);
      const { data: admin, error: adminError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin')
        .limit(1)
        .maybeSingle();

      if (adminError || !admin) {
        if (active) {
          setErrorMessage(
            adminError?.message || 'Admin support is not configured yet.'
          );
          setIsLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: true });

      if (!active) return;
      setAdminId(admin.id);
      if (error) {
        setErrorMessage(error.message);
      } else {
        setMessages(await hydrateChatMessages((data || []) as ChatMessage[]));
      }
      setIsLoading(false);
    }

    void loadConversation();

    const channel = supabase
      .channel(`student-messages-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          const incoming = payload.new as ChatMessage;
          if (
            incoming.sender_id === userId ||
            incoming.receiver_id === userId
          ) {
            const [message] = await hydrateChatMessages([incoming]);
            if (active) {
              setMessages((previous) => mergeChatMessage(previous, message));
              if (
                incoming.sender_id !== userId &&
                document.visibilityState === 'visible'
              ) {
                setToastMessage(incoming.content || 'Admin sent an attachment');
                window.setTimeout(() => setToastMessage(null), 5000);
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const userId = user?.id;
    if (!isOpen || !userId) return;

    const unreadIds = messages
      .filter(
        (message) => message.receiver_id === userId && !message.is_read
      )
      .map((message) => message.id);
    if (unreadIds.length === 0) return;

    let active = true;
    void supabase
      .from('messages')
      .update({ is_read: true })
      .in('id', unreadIds)
      .eq('receiver_id', userId)
      .then(({ error }) => {
        if (!active || error) return;
        setMessages((previous) =>
          previous.map((message) =>
            unreadIds.includes(message.id)
              ? { ...message, is_read: true }
              : message
          )
        );
      });

    return () => {
      active = false;
    };
  }, [isOpen, messages, user?.id]);

  // IMAGE UPLOAD HANDLER
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !adminId || !user?.id) return;

    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      setErrorMessage('Choose an image smaller than 5 MB.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileName = `${user.id}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from('chat-images')
        .upload(fileName, file, { contentType: file.type, upsert: false });

      if (uploadError) throw uploadError;

      const { data, error } = await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: adminId,
        content: 'Sent an image',
        image_url: fileName,
      }).select('*').single();
      if (error) throw error;
      const [message] = await hydrateChatMessages([data as ChatMessage]);
      setMessages((previous) => mergeChatMessage(previous, message));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Image upload failed.'
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !adminId || !user?.id) return;

    const msgText = newMessage.trim();
    setIsSending(true);
    setErrorMessage(null);
    try {
      const { data, error } = await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: adminId,
        content: msgText,
        image_url: null,
      }).select('*').single();
      if (error) throw error;
      const [message] = await hydrateChatMessages([data as ChatMessage]);
      setMessages((previous) => mergeChatMessage(previous, message));
      setNewMessage((current) => (current === msgText ? '' : current));
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Message could not be sent.'
      );
    } finally {
      setIsSending(false);
    }
  };

  const unreadCount = user
    ? messages.filter(
        (message) => message.receiver_id === user.id && !message.is_read
      ).length
    : 0;

  if (!user || user.id === 'demo_user') return null;
  return (
    <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 animate-fade-in">
      {toastMessage && (
        <div
          role="status"
          className="absolute bottom-full right-0 mb-3 flex max-w-72 items-start gap-3 rounded-xl border border-emerald-400/30 bg-slate-950/95 p-3 text-sm text-white shadow-xl"
        >
          <span className="min-w-0 flex-1">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            aria-label="Dismiss notification"
            className="text-white/60 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {isOpen && (
        <div className="mb-4 w-[320px] md:w-[380px] h-[500px] bg-[#0f172a]/90 backdrop-blur-3xl border border-white/20 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-slide-up origin-bottom-right">

          <div className="p-4 bg-emerald-500/20 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center text-white font-bold shadow-inner">
                  A
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#0f172a] rounded-full"></div>
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Admin Support</h3>
                <p className="text-emerald-300/70 text-[10px] font-bold uppercase tracking-widest">Typically replies instantly</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white transition-colors bg-white/5 p-2 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {errorMessage && (
              <div role="alert" className="rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-xs text-rose-100">
                {errorMessage}
              </div>
            )}
            {isLoading ? (
              <div className="mt-10 flex justify-center text-white/50">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-white/40 text-sm mt-10">
                {adminId ? 'Send a message to start the conversation.' : 'Connecting to admin support...'}
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = msg.sender_id === user.id;
                return (
                  <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-md flex flex-col gap-2 ${
                      isMe
                        ? 'bg-emerald-500 text-white rounded-br-sm'
                        : 'bg-white/10 text-white border border-white/10 rounded-bl-sm'
                    }`}>
                      {/* Render Image if it exists */}
                      {msg.imageSrc && (
                        <img
                          src={msg.imageSrc}
                          alt="Chat attachment"
                          className="rounded-xl max-w-full h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(msg.imageSrc!, '_blank', 'noopener,noreferrer')}
                        />
                      )}

                      {/* Render Text (unless it's just the fallback text for an image-only message) */}
                      {!(msg.image_url && msg.content === 'Sent an image') && (
                        <span>{msg.content}</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="p-4 bg-white/5 border-t border-white/10 flex gap-2 items-center">
            {/* Hidden File Input */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />

            {/* Image Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isSending || !adminId}
              className="p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50 shrink-0"
              title="Upload Image"
            >
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
            </button>

            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={isUploading || isSending || !adminId}
              className="flex-1 bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />

            <button
              type="submit"
              disabled={!newMessage.trim() || !adminId || isUploading || isSending}
              className="p-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label={
            unreadCount > 0
              ? `Open chat, ${unreadCount} unread messages`
              : 'Open chat'
          }
          className="relative w-14 h-14 md:w-16 md:h-16 bg-emerald-500 hover:bg-emerald-400 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-transform hover:scale-110 border border-emerald-400/50 group"
        >
          <MessageCircle className="w-6 h-6 md:w-7 md:h-7 group-hover:animate-pulse" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 grid h-6 min-w-6 place-items-center rounded-full border-2 border-slate-950 bg-rose-500 px-1 text-xs font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
}