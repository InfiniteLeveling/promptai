import React, { useState, useEffect } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { ChatSidebar } from '../chat/ChatSidebar';
import { ChatToolbar } from '../chat/ChatToolbar';
import { MessageList } from '../chat/MessageList';
import { ChatInputBar } from '../chat/ChatInputBar';

export const SandboxShell: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  const { createNewConversation } = useChatStore();

  // Global keyboard shortcuts:
  // Cmd/Ctrl+N: Start fresh chat
  // Cmd/Ctrl+K: Focus prompt input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        createNewConversation();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const textarea = document.querySelector('textarea');
        textarea?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createNewConversation]);

  return (
    <div className="flex h-screen w-screen bg-surface-container-lowest text-on-surface overflow-hidden relative">
      {/* Mobile dark backdrop when sidebar is open */}
      {!isSidebarCollapsed && (
        <div
          onClick={() => setIsSidebarCollapsed(true)}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-25 transition-opacity"
        />
      )}

      {/* 1. Collapsible 260px Conversation Sidebar */}
      <ChatSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* 2. Main Central Conversational Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        {/* Top Chat Toolbar & Model Selector */}
        <ChatToolbar />

        {/* Scrollable Conversation Thread with Inline Artifacts */}
        <MessageList />

        {/* Floating Bottom Input Capsule */}
        <ChatInputBar />
      </div>
    </div>
  );
};
