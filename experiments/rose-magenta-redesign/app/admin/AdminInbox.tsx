'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { MessageSquare, Send, Image as ImageIcon, Loader2, Search } from 'lucide-react';
import { ChatMessage, hydrateChatMessages, mergeChatMessage } from '@/lib/chatMessages';

interface StudentProfile {
  id: string;
  name?: string | null;
  email?: string | null;
}

export default function AdminInbox({
  unreadCounts,
  onConversationRead,
}: {
  unreadCounts: Record<string, number>;
  onConversationRead: (studentId: string) => void;
}) {
  const [adminId, setAdminId] = useState<string | null>(null);
  const [adminIds, setAdminIds] = useState<string[]>([]);
  const [conversations, setConversations] = useState<StudentProfile[]>([]);
  const [activeUser, setActiveUser] = useState<StudentProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadedStudentId, setLoadedStudentId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;

    async function loadInbox() {
      setLoading(true);
      setErrorMessage(null);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        if (active) {
          setErrorMessage(sessionError?.message || 'Sign in as an admin to open the inbox.');
          setLoading(false);
        }
        return;
      }

      const currentAdminId = session.user.id;
      const { data: adminProfiles, error: adminProfilesError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin');
      const visibleAdminIds = Array.from(
        new Set([currentAdminId, ...(adminProfiles || []).map((profile) => profile.id)])
      );
      const adminIdSet = new Set(visibleAdminIds);
      if (active) {
        setAdminId(currentAdminId);
        setAdminIds(visibleAdminIds);
        if (adminProfilesError) setErrorMessage(adminProfilesError.message);
      }

      const { data: msgs, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (!active) return;
      if (messagesError) {
        setErrorMessage(messagesError.message);
        setLoading(false);
        return;
      }

      const studentIds = Array.from(
        new Set(
          (msgs || []).map((message) =>
            adminIdSet.has(message.sender_id)
              ? message.receiver_id
              : message.sender_id
          ).filter((id) => !adminIdSet.has(id))
        )
      );

      if (studentIds.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', studentIds);

      if (!active) return;
      if (profilesError) setErrorMessage(profilesError.message);
      const profileById = new Map(
        ((profiles || []) as StudentProfile[]).map((profile) => [profile.id, profile])
      );
      const resolvedProfiles = studentIds.map(
        (id) =>
          profileById.get(id) || {
            id,
            name: null,
            email: `Student ${id.slice(0, 8)}`,
          }
      );
      setConversations(resolvedProfiles);
      setLoading(false);
    }

    void loadInbox();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const studentId = activeUser?.id;
    if (!adminId || adminIds.length === 0 || !studentId) return;
    let active = true;
    const adminIdList = adminIds.join(',');

    async function fetchChat(studentId: string) {
      setErrorMessage(null);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.in.(${adminIdList}),receiver_id.eq.${studentId}),and(sender_id.eq.${studentId},receiver_id.in.(${adminIdList}))`
        )
        .order('created_at', { ascending: true });

      if (!active) return;
      if (error) {
        setErrorMessage(error.message);
        return;
      }
      const hydratedMessages = await hydrateChatMessages(
        (data || []) as ChatMessage[]
      );
      if (!active) return;
      setMessages(hydratedMessages);
      setLoadedStudentId(studentId);

      const { error: readError } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', studentId)
        .in('receiver_id', adminIds);
      if (readError && active) {
        setErrorMessage(readError.message);
      } else if (active) {
        onConversationRead(studentId);
      }
    }

    void fetchChat(studentId);
    return () => {
      active = false;
    };
  }, [activeUser?.id, adminId, adminIds, onConversationRead]);

  useEffect(() => {
    if (!adminId || adminIds.length === 0) return;
    let active = true;
    const activeStudentId = activeUser?.id;

    const channel = supabase
      .channel('admin_inbox')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          const incoming = payload.new as ChatMessage;
          if (
            !adminIds.includes(incoming.sender_id) &&
            !adminIds.includes(incoming.receiver_id)
          ) return;

          if (
            activeStudentId &&
            (incoming.sender_id === activeStudentId ||
              incoming.receiver_id === activeStudentId)
          ) {
            const [message] = await hydrateChatMessages([incoming]);
            if (active) {
              setMessages((previous) => mergeChatMessage(previous, message));
            }
          }

          if (
            active &&
            incoming.sender_id === activeStudentId &&
            adminIds.includes(incoming.receiver_id) &&
            !incoming.is_read
          ) {
            void supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', incoming.id)
              .eq('receiver_id', incoming.receiver_id);
          }

          const conversationStudentId =
            adminIds.includes(incoming.sender_id)
              ? incoming.receiver_id
              : incoming.sender_id;
          if (adminIds.includes(conversationStudentId)) return;
          if (!conversations.some((student) => student.id === conversationStudentId)) {
            const { data: student } = await supabase
              .from('profiles')
              .select('id, name, email')
              .eq('id', conversationStudentId)
              .maybeSingle();
            if (student && active) {
              setConversations((previous) =>
                previous.some((item) => item.id === student.id)
                  ? previous
                  : [student as StudentProfile, ...previous]
              );
            }
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [adminId, adminIds, activeUser?.id, conversations]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !adminId || !activeUser) return;

    const msgText = newMessage.trim();
    setIsSending(true);
    setErrorMessage(null);
    try {
      const { data, error } = await supabase.from('messages').insert({
        sender_id: adminId,
        receiver_id: activeUser.id,
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !adminId || !activeUser) return;
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      setErrorMessage('Choose an image smaller than 5 MB.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileName = `${adminId}/${activeUser.id}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from('chat-images')
        .upload(fileName, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;

      const { data, error } = await supabase.from('messages').insert({
        sender_id: adminId,
        receiver_id: activeUser.id,
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

  const filteredConversations = conversations.filter((student) =>
    `${student.name || ''} ${student.email || ''}`
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase())
  );
  const visibleMessages =
    loadedStudentId === activeUser?.id ? messages : [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-emerald-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="font-medium text-white/70">Loading inbox...</p>
      </div>
    );
  }

  return (
    <div className="h-[80vh] bg-white/5 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] flex overflow-hidden animate-fade-in text-white">

      {/* LEFT SIDEBAR: CONVERSATIONS LIST */}
      <div className="w-1/3 md:w-80 border-r border-white/10 flex flex-col bg-white/[0.02]">
        <div className="p-5 border-b border-white/10">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" /> Inbox
          </h2>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white placeholder-white/30"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="text-center text-white/40 p-4 text-sm mt-4">
              {conversations.length === 0 ? 'No conversations yet.' : 'No students match your search.'}
            </div>
          ) : (
            filteredConversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveUser(c)}
                className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors ${
                  activeUser?.id === c.id ? 'bg-emerald-500/20 border border-emerald-500/30' : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">
                  {c.name?.charAt(0).toUpperCase() || 'S'}
                </div>
                <div className="overflow-hidden flex-1">
                  <h4 className="font-bold text-sm text-white truncate">{c.name || c.email}</h4>
                  <p className="text-xs text-white/50 truncate">Student</p>
                </div>
                {(unreadCounts[c.id] || 0) > 0 && (
                  <span className="grid h-6 min-w-6 shrink-0 place-items-center rounded-full bg-rose-500 px-1.5 text-xs font-bold text-white">
                    {unreadCounts[c.id] > 99 ? '99+' : unreadCounts[c.id]}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* RIGHT SIDE: ACTIVE CHAT */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-[#020617]/50">
        {errorMessage && (
          <div role="alert" className="absolute left-4 right-4 top-4 z-10 rounded-xl border border-rose-400/30 bg-rose-950/90 p-3 text-sm text-rose-100">
            {errorMessage}
          </div>
        )}
        {!activeUser ? (
          <div className="flex-1 flex flex-col items-center justify-center text-white/30">
            <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-bold text-white/50">Select a conversation</p>
            <p className="text-sm">Choose a student from the left to start chatting.</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white/5 border-b border-white/10 flex items-center gap-3 backdrop-blur-md">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {activeUser.name?.charAt(0).toUpperCase() || 'S'}
              </div>
              <div>
                <h3 className="font-bold text-white">{activeUser.name || activeUser.email}</h3>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Student</p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
              {visibleMessages.map((msg, idx) => {
                const isMe = msg.sender_id === adminId;
                return (
                  <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] p-3 md:p-4 rounded-2xl text-sm shadow-md flex flex-col gap-2 ${
                      isMe
                        ? 'bg-emerald-500/20 text-emerald-50 border border-emerald-500/30 rounded-br-sm'
                        : 'bg-white/10 text-white border border-white/20 rounded-bl-sm'
                    }`}>
                      {msg.imageSrc && (
                        <img
                          src={msg.imageSrc}
                          alt="Attachment"
                          className="rounded-lg max-w-full h-auto object-cover cursor-pointer hover:opacity-90 transition-opacity border border-white/10"
                          onClick={() => window.open(msg.imageSrc!, '_blank', 'noopener,noreferrer')}
                        />
                      )}
                      {!(msg.image_url && msg.content === 'Sent an image') && (
                        <span className="leading-relaxed">{msg.content}</span>
                      )}
                      <span className="text-[9px] text-white/40 self-end mt-1 uppercase">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={sendMessage} className="p-4 bg-white/5 border-t border-white/10 flex gap-2 items-center backdrop-blur-md">
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
              <button
                type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading || isSending}
                className="p-3 bg-white/5 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-colors shrink-0"
              >
                {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
              </button>

              <input
                type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Reply to ${activeUser.name?.split(' ')[0] || 'student'}...`}
                disabled={isUploading || isSending}
                className="flex-1 bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />

              <button
                type="submit" disabled={!newMessage.trim() || isUploading || isSending}
                className="p-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}