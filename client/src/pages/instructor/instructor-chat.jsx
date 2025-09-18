import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/context/auth-context';
import { ChatContext } from '@/context/chat-context';
import { getInstructorChatsService, getChatByIdService } from '@/services';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Inbox, Search, RefreshCcw, MessageSquare } from 'lucide-react';
import ChatList from '@/components/chat/ChatList';
import ChatInterface from '@/components/chat/ChatInterface';
import InstructorNav from '@/components/instructor-view/nav';

const InstructorChatPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const { auth, resetCredentials } = useContext(AuthContext);
  const { 
    chatList, 
    setChatList, 
    loading, 
    setLoading, 
    error, 
    setError,
    unreadCounts,
    updateUnreadCounts
  } = useContext(ChatContext);
  
  useEffect(() => {
    if (auth?.user?._id) {
      fetchInstructorChats();
    }
  }, [auth?.user?._id]);
  
  const fetchInstructorChats = async () => {
    if (!auth?.user?._id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getInstructorChatsService(auth.user._id);
      
      if (response.success) {
        setChatList(response.data);
        updateUnreadCounts(response.data, auth.user._id);
      } else {
        setError(response.message || 'Failed to load chats');
      }
    } catch (error) {
      console.error('Error loading instructor chats:', error);
      setError('Failed to load chats. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectChat = async (chat) => {
    // If it's the same chat, just return
    if (selectedChat && chat._id === selectedChat._id) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Get the full chat with messages
      const response = await getChatByIdService(chat._id);
      
      if (response.success) {
        setSelectedChat(response.data);
        
        // Update unread counts
        if (unreadCounts[chat._id] > 0) {
          const newUnreadCounts = { ...unreadCounts };
          newUnreadCounts[chat._id] = 0;
          updateUnreadCounts([response.data], auth.user._id);
        }
      } else {
        setError(response.message || 'Failed to load chat');
      }
    } catch (error) {
      console.error('Error loading chat:', error);
      setError('Failed to load chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate total unread count
  const totalUnreadCount = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
  
  const handleLogout = async () => {
    await resetCredentials();
    sessionStorage.clear();
    localStorage.clear();
  };
  
  return (
    <div className="flex h-full min-h-screen bg-gray-100">
      <InstructorNav
        activeTab="messages"
        setActiveTab={() => {}}
        handleLogout={handleLogout}
      />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Student Messages</h1>
          
          <div className="flex flex-col md:flex-row gap-4 bg-white rounded-lg shadow-md border border-gray-200">
            {/* Left panel - Chat list */}
            <div className="w-full md:w-1/3 border-r border-gray-200">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Inbox className="h-5 w-5 text-gray-500" />
                  <h2 className="font-semibold">Inbox</h2>
                  {totalUnreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {totalUnreadCount}
                    </span>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={fetchInstructorChats}
                  disabled={loading}
                >
                  <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              
              {error && (
                <div className="p-4 text-red-500 text-sm">{error}</div>
              )}
              
              {!loading && chatList.length === 0 ? (
                <div className="h-96 flex flex-col items-center justify-center p-6 text-center">
                  <MessageSquare className="h-12 w-12 mb-3 text-gray-300" />
                  <h3 className="font-medium text-lg mb-1">No messages</h3>
                  <p className="text-sm text-gray-500">
                    When students message you about your courses, the conversations will appear here.
                  </p>
                </div>
              ) : (
                <div className="h-[calc(100vh-350px)] overflow-y-auto">
                  <ChatList 
                    chats={chatList}
                    onChatSelect={handleSelectChat}
                    unreadCounts={unreadCounts}
                    activeChatId={selectedChat?._id}
                  />
                </div>
              )}
            </div>
            
            {/* Right panel - Chat interface */}
            <div className="flex-1 h-[calc(100vh-350px)]">
              {selectedChat ? (
                <ChatInterface 
                  chat={selectedChat}
                  onClose={() => setSelectedChat(null)}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center text-gray-500">
                  <MessageSquare className="h-16 w-16 mb-4 text-gray-300" />
                  <h3 className="font-medium text-xl mb-2">Select a conversation</h3>
                  <p className="text-gray-400">
                    Choose a conversation from the list to view messages
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InstructorChatPage;