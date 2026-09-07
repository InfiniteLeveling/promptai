import React, { useState } from 'react';
import { useChatStore } from '../../store/useChatStore';
import {
  Plus,
  MessageSquare,
  Pin,
  Trash2,
  Edit2,
  Check,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface ChatSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const {
    conversations,
    activeConversationId,
    createNewConversation,
    selectConversation,
    deleteConversation,
    renameConversation,
    togglePinConversation,
    clearAllConversations
  } = useChatStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const convList = Object.values(conversations).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const now = new Date();
  const isToday = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };

  const isYesterday = (dateStr: string) => {
    const d = new Date(dateStr);
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    return d.getDate() === y.getDate() && d.getMonth() === y.getMonth() && d.getFullYear() === y.getFullYear();
  };

  const pinnedConvs = convList.filter((c) => c.pinned);
  const todayConvs = convList.filter((c) => !c.pinned && isToday(c.updatedAt));
  const yesterdayConvs = convList.filter((c) => !c.pinned && isYesterday(c.updatedAt));
  const olderConvs = convList.filter((c) => !c.pinned && !isToday(c.updatedAt) && !isYesterday(c.updatedAt));

  const handleStartRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      renameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const templatePills = [
    { label: 'SaaS Platform', prompt: 'Build a multi-tenant B2B SaaS architecture with PostgreSQL, Stripe billing, and Next.js 15.' },
    { label: 'Fintech Engine', prompt: 'Architect a high-throughput Stripe webhook reconciliation service with distributed Redis locks.' },
    { label: 'Mobile Sync', prompt: 'Design an offline-first mobile app in React Native with encrypted local SQLite and biometric auth.' }
  ];

  if (isCollapsed) {
    return (
      <aside className="w-14 h-screen border-r border-outline-variant/20 bg-surface-container-lowest flex flex-col items-center py-3.5 space-y-4 shrink-0 z-30 select-none">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-xl hover:bg-surface-container text-outline hover:text-on-surface transition-colors"
          title="Expand Sidebar"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => createNewConversation()}
          className="w-9 h-9 rounded-xl bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary flex items-center justify-center transition-all shadow-sm"
          title="New Chat"
        >
          <Plus className="w-4 h-4" />
        </button>

        <div className="flex-1 overflow-y-auto space-y-2 py-2">
          {convList.slice(0, 8).map((c) => (
            <button
              key={c.id}
              onClick={() => selectConversation(c.id)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs transition-all ${
                c.id === activeConversationId
                  ? 'bg-primary/20 border border-primary text-primary'
                  : 'hover:bg-surface-container text-outline hover:text-on-surface'
              }`}
              title={c.title}
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          ))}
        </div>
      </aside>
    );
  }

  const renderConvItem = (c: (typeof convList)[0]) => {
    const isActive = c.id === activeConversationId;
    const isEditing = c.id === editingId;

    return (
      <div
        key={c.id}
        onClick={() => selectConversation(c.id)}
        className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all duration-150 ${
          isActive
            ? 'bg-surface-container-high border border-outline-variant/40 text-on-surface font-semibold shadow-sm'
            : 'hover:bg-surface-container/80 text-on-surface-variant hover:text-on-surface'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 pr-1">
          <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-primary' : 'text-outline'}`} />

          {isEditing ? (
            <div className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveRename(c.id, e);
                  if (e.key === 'Escape') setEditingId(null);
                }}
                autoFocus
                className="w-full bg-surface-container px-1.5 py-0.5 rounded border border-primary text-xs text-on-surface focus:outline-none"
              />
              <button
                onClick={(e) => handleSaveRename(c.id, e)}
                className="p-1 hover:text-primary text-outline"
              >
                <Check className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingId(null);
                }}
                className="p-1 hover:text-red-400 text-outline"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <span className="truncate font-sans text-xs">{c.title}</span>
          )}
        </div>

        {/* Hover action menu */}
        {!isEditing && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePinConversation(c.id);
              }}
              className={`p-1 rounded hover:bg-surface-container ${c.pinned ? 'text-primary' : 'text-outline hover:text-on-surface'}`}
              title={c.pinned ? 'Unpin' : 'Pin to top'}
            >
              <Pin className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => handleStartRename(c.id, c.title, e)}
              className="p-1 rounded hover:bg-surface-container text-outline hover:text-on-surface"
              title="Rename"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteConversation(c.id);
              }}
              className="p-1 rounded hover:bg-surface-container text-outline hover:text-red-400"
              title="Delete conversation"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-[260px] h-screen border-r border-outline-variant/20 bg-surface-container-lowest flex flex-col shrink-0 z-30 select-none">
      {/* Top Header */}
      <div className="h-14 px-3 flex items-center justify-between border-b border-outline-variant/15">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-surface-container-lowest font-black text-xs shadow-sm">
            PA
          </div>
          <span className="font-bold text-xs tracking-tight text-on-surface">PromptArchitect</span>
        </div>

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg hover:bg-surface-container text-outline hover:text-on-surface transition-colors"
          title="Collapse Sidebar"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-3 border-b border-outline-variant/15">
        <button
          onClick={() => createNewConversation()}
          className="w-full py-2.5 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-xs font-semibold text-on-surface flex items-center justify-between transition-all hover:border-primary/40 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" />
            <span>New Chat</span>
          </div>
          <span className="text-[10px] font-mono text-outline bg-surface-container-lowest px-1.5 py-0.5 rounded border border-outline-variant/20">
            ⌘N
          </span>
        </button>
      </div>

      {/* Conversation Thread History */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-3 space-y-4">
        {/* Pinned Threads */}
        {pinnedConvs.length > 0 && (
          <div className="space-y-1">
            <div className="px-2 text-[10px] font-mono uppercase tracking-wider text-outline flex items-center gap-1">
              <Pin className="w-2.5 h-2.5 text-primary" />
              <span>Pinned</span>
            </div>
            {pinnedConvs.map(renderConvItem)}
          </div>
        )}

        {/* Today */}
        {todayConvs.length > 0 && (
          <div className="space-y-1">
            <div className="px-2 text-[10px] font-mono uppercase tracking-wider text-outline">
              Today
            </div>
            {todayConvs.map(renderConvItem)}
          </div>
        )}

        {/* Yesterday */}
        {yesterdayConvs.length > 0 && (
          <div className="space-y-1">
            <div className="px-2 text-[10px] font-mono uppercase tracking-wider text-outline">
              Yesterday
            </div>
            {yesterdayConvs.map(renderConvItem)}
          </div>
        )}

        {/* Older */}
        {olderConvs.length > 0 && (
          <div className="space-y-1">
            <div className="px-2 text-[10px] font-mono uppercase tracking-wider text-outline">
              Previous
            </div>
            {olderConvs.map(renderConvItem)}
          </div>
        )}
      </div>

      {/* Quick Architecture Templates Section */}
      <div className="p-3 border-t border-outline-variant/15 space-y-2 bg-surface-container/20">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-outline">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-tertiary" />
            <span>Templates</span>
          </span>
        </div>

        <div className="flex flex-wrap gap-1">
          {templatePills.map((t, idx) => (
            <button
              key={idx}
              onClick={() => createNewConversation(t.label, t.prompt)}
              className="px-2 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/25 text-[11px] text-on-surface-variant hover:text-on-surface transition-all"
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Footer / Clear Action */}
      <div className="p-2.5 border-t border-outline-variant/15 flex items-center justify-between text-xs text-outline">
        <span className="text-[10px] font-mono">v3.0.0 Fastify</span>

        {showClearConfirm ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                clearAllConversations();
                setShowClearConfirm(false);
              }}
              className="text-[10px] font-mono text-red-400 hover:underline"
            >
              Confirm Clear
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="text-[10px] font-mono text-outline hover:text-on-surface ml-1"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="text-[10px] font-mono hover:text-red-400 transition-colors flex items-center gap-1"
            title="Clear all chat history"
          >
            <ShieldAlert className="w-3 h-3" />
            <span>Clear History</span>
          </button>
        )}
      </div>
    </aside>
  );
};
