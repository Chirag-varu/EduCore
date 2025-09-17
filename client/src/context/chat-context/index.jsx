import { createContext, useState } from "react";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [activeChat, setActiveChat] = useState(null);
  const [chatList, setChatList] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Method to calculate unread messages for a chat
  const calculateUnreadCount = (chat, userId) => {
    if (!chat || !chat.messages || !userId) return 0;
    
    return chat.messages.filter(
      message => message.sender !== userId && !message.isRead
    ).length;
  };
  
  // Update unread counts for all chats
  const updateUnreadCounts = (chats, userId) => {
    const newCounts = {};
    
    chats.forEach(chat => {
      newCounts[chat._id] = calculateUnreadCount(chat, userId);
    });
    
    setUnreadCounts(newCounts);
  };
  
  const value = {
    activeChat,
    setActiveChat,
    chatList,
    setChatList,
    unreadCounts,
    setUnreadCounts,
    loading,
    setLoading,
    error,
    setError,
    calculateUnreadCount,
    updateUnreadCounts
  };
  
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};