import React from 'react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, UserCircle } from 'lucide-react';

const ChatListItem = ({ chat, unreadCount = 0, onClick, isActive }) => {
  // Determine if this is a student or instructor view
  const isStudentView = !!chat.instructorId?.userName;
  
  // Get the other person's name
  const otherPersonName = isStudentView 
    ? chat.instructorId?.userName || 'Instructor'
    : chat.studentId?.userName || 'Student';
    
  // Get the latest message
  const lastMessage = chat.messages && chat.messages.length > 0
    ? chat.messages[chat.messages.length - 1]
    : null;
  
  // Format the last activity time
  const lastActivityTime = chat.lastActivity 
    ? formatDistanceToNow(new Date(chat.lastActivity), { addSuffix: true })
    : 'No activity';
    
  return (
    <div 
      className={`
        p-3 border-b border-gray-100 flex items-center cursor-pointer transition-colors
        ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'} 
      `}
      onClick={() => onClick(chat)}
    >
      {/* Avatar */}
      <div className="mr-3 relative">
        <UserCircle className="h-10 w-10 text-gray-400" />
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 flex items-center justify-center p-0 rounded-full"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </div>
      
      {/* Chat info */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <h4 className="font-medium text-gray-900 truncate">{otherPersonName}</h4>
          <span className="text-xs text-gray-500">{lastActivityTime}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <span className="truncate">
            {lastMessage 
              ? lastMessage.content 
              : 'No messages yet'}
          </span>
        </div>
        <div className="text-xs text-gray-400 truncate mt-1">
          {chat.courseId?.title || 'Course Chat'}
        </div>
      </div>
    </div>
  );
};

export default ChatListItem;