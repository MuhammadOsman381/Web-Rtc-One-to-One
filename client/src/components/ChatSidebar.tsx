import React, { useRef, useEffect } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

interface Message {
  from: string;
  message: string;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  userName: string;
  message: string;
  setMessage: (msg: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  unreadCount: number;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isOpen,
  onClose,
  messages,
  userName,
  message,
  setMessage,
  onSendMessage,
}) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  return (
    <div
      className={`fixed top-0 right-0 h-full w-full max-w-sm md:w-[380px] bg-[var(--bg-surface)] border-l border-[var(--border)] shadow-2xl transition-transform duration-500 ease-in-out z-[60] flex flex-col ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-overlay)] backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--brand-subtle)] flex items-center justify-center text-[var(--brand)]">
            <MessageSquare size={20} />
          </div>
          <div>
            <h2 className="font-bold text-lg text-[var(--text-primary)]">Chat</h2>
            <p className="text-xs text-[var(--text-muted)] font-medium">Internal Room Discussion</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2.5 rounded-xl hover:bg-[var(--bg-muted)] text-[var(--text-muted)] transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
            <div className="w-20 h-20 rounded-3xl bg-[var(--bg-muted)] flex items-center justify-center">
              <MessageSquare size={32} />
            </div>
            <div>
              <p className="font-bold text-[var(--text-primary)]">No messages yet</p>
              <p className="text-sm text-[var(--text-muted)]">Messages will appear here once sent</p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.from === userName;
            return (
              <div
                key={idx}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fadeInUp`}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                {!isMe && (
                  <span className="text-[10px] font-bold text-[var(--brand)] mb-1.5 ml-3 uppercase tracking-wider">
                    {msg.from}
                  </span>
                )}
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${
                    isMe
                      ? 'bg-[var(--brand)] text-white rounded-tr-none'
                      : 'bg-[var(--bg-muted)] text-[var(--text-primary)] rounded-tl-none border border-[var(--border)]'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-overlay)] backdrop-blur-md">
        <form onSubmit={onSendMessage} className="relative flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="input-base w-full py-3 px-4 pr-12 rounded-2xl text-sm"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="absolute right-1.5 w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--brand)] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all shadow-lg shadow-orange-500/20"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatSidebar;
