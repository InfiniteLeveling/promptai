import React, { useState } from 'react';
import { ChatSidebar } from '../chat/ChatSidebar';
import { ChatToolbar } from '../chat/ChatToolbar';
import { MessageList } from '../chat/MessageList';
import { ChatInputBar } from '../chat/ChatInputBar';

export const SandboxShell: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-screen bg-surface-container-lowest text-on-surface overflow-hidden relative">
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
