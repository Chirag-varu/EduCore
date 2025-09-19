import React, { useState, useEffect, useContext } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { AuthContext } from '@/context/auth-context';
import { ChatContext } from '@/context/chat-context';
import { 
  getStudentChatsService, 
  getOrCreateCourseChatService,
  getChatByIdService 
} from '@/services';
import ChatList from './ChatList';
import ChatInterface from './ChatInterface';

const StudentChatDrawer = ({ courseId, instructorId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [view, setView] = useState('list'); // 'list' or 'chat'
  
  const { auth } = useContext(AuthContext);
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
  
  // Load student's chats when drawer opens
  useEffect(() => {
    if (isOpen && auth?.user?._id) {
      fetchStudentChats();
    }
  }, [isOpen, auth?.user?._id]);
  
  const fetchStudentChats = async () => {
    if (!auth?.user?._id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getStudentChatsService(auth.user._id);
      
      if (response.success) {
        setChatList(response.data);
        updateUnreadCounts(response.data, auth.user._id);
      } else {
        setError(response.message || 'Failed to load chats');
      }
    } catch (error) {
      console.error('Error loading student chats:', error);
      setError('Failed to load chats. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Start or continue chat with the instructor of this course
  const handleStartChat = async () => {
    if (!auth?.user?._id || !courseId || !instructorId) return;
    
    setLoading(true);
    
    try {
      const response = await getOrCreateCourseChatService(
        courseId,
        auth.user._id,
        auth.user._id
      );
      
      if (response.success) {
        setSelectedChat(response.data);
        setView('chat');
        
        // Add this chat to the list if it's not already there
        const chatExists = chatList.some(chat => chat._id === response.data._id);
        if (!chatExists) {
          setChatList([response.data, ...chatList]);
        }
      } else {
        setError(response.message || 'Failed to start chat');
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      setError('Failed to start chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectChat = async (chat) => {
    // If it's the same chat, just switch to chat view
    if (selectedChat && chat._id === selectedChat._id) {
      setView('chat');
      return;
    }
    
    setLoading(true);
    
    try {
      // Get the full chat with messages
      const response = await getChatByIdService(chat._id);
      
      if (response.success) {
        setSelectedChat(response.data);
        setView('chat');
        
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
  
  // Calculate total unread count for the badge
  const totalUnreadCount = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="relative flex items-center gap-2 bg-white shadow-sm border-gray-200 hover:bg-gray-50 text-black"
        >
          <MessageSquare className="h-4 w-4" />
          <span>Chat with Instructor</span>
          {totalUnreadCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-[400px] p-0 flex flex-col">
        {view === 'list' ? (
          <>
            <SheetHeader className="p-4 border-b">
              <SheetTitle>Messages</SheetTitle>
            </SheetHeader>
            
            {!chatList.length && courseId && instructorId ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                <MessageSquare className="h-12 w-12 mb-3 text-gray-300" />
                <h3 className="font-medium text-lg mb-3">No conversations yet</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Start a conversation with the instructor of this course
                </p>
                <Button onClick={handleStartChat} disabled={loading}>
                  {loading ? 'Starting chat...' : 'Message Instructor'}
                </Button>
              </div>
            ) : (
              <ChatList
                chats={chatList}
                onChatSelect={handleSelectChat}
                unreadCounts={unreadCounts}
              />
            )}
          </>
        ) : (
          <div className="h-full">
            <ChatInterface
              chat={selectedChat}
              onClose={() => setIsOpen(false)}
              onBack={() => setView('list')}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default StudentChatDrawer;