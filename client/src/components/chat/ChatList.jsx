import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatListItem from './ChatListItem';
import { MessageSquare } from 'lucide-react';

const ChatList = ({ chats, onChatSelect, unreadCounts = {}, activeChatId }) => {
  if (!chats || chats.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-gray-500">
        <MessageSquare className="h-12 w-12 mb-3 text-gray-300" />
        <h3 className="font-medium text-lg mb-1">No conversations yet</h3>
        <p className="text-sm text-gray-400">
          When you have conversations, they'll appear here.
        </p>
      </div>
    );
  }
  
  return (
    <ScrollArea className="h-full">
      {chats.map(chat => (
        <ChatListItem 
          key={chat._id}
          chat={chat}
          unreadCount={unreadCounts[chat._id] || 0}
          onClick={() => onChatSelect(chat)}
          isActive={activeChatId === chat._id}
        />
      ))}
    </ScrollArea>
  );
};

export default ChatList;