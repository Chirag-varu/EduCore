import React, { useState, useEffect, useContext, useRef } from 'react';
import { Send, X, ArrowLeft, UserCircle } from 'lucide-react';
import { AuthContext } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  sendMessageService,
  markMessagesAsReadService
} from '@/services';

const ChatInterface = ({ chat, onClose, onBack }) => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const { auth } = useContext(AuthContext);
  const messagesEndRef = useRef(null);
  
  // Set initial messages from chat
  useEffect(() => {
    if (chat?.messages) {
      setMessages(chat.messages);
      markMessagesAsRead();
      scrollToBottom();
    }
  }, [chat]);
  
  // Auto scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const markMessagesAsRead = async () => {
    if (!chat?._id || !auth?.user?._id) return;
    
    await markMessagesAsReadService(chat._id, auth.user._id);
  };
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !chat?._id || !auth?.user?._id) return;
    
    setSending(true);
    
    try {
      const response = await sendMessageService(
        chat._id,
        auth.user._id,
        newMessage.trim()
      );
      
      if (response.success) {
        setMessages([...messages, response.data]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };
  
  const isCurrentUser = (senderId) => {
    return senderId === auth?.user?._id;
  };
  
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Determine if this user is the student or instructor
  const isStudent = auth?.user?._id === chat?.studentId;
  const otherUser = isStudent 
    ? { name: chat?.instructorId?.userName || 'Instructor', id: chat?.instructorId } 
    : { name: chat?.studentId?.userName || 'Student', id: chat?.studentId };
  
  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md border border-gray-200">
      {/* Chat header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-2">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="mr-1"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            <UserCircle className="h-8 w-8 text-gray-400" />
            <div>
              <h3 className="font-semibold text-gray-800">{otherUser.name}</h3>
              <p className="text-xs text-gray-500">
                {chat?.courseId?.title || 'Course Chat'}
              </p>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="rounded-full h-8 w-8 p-0"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Chat messages */}
      <ScrollArea className="flex-1 p-4 bg-gray-50">
        <div className="flex flex-col gap-3">
          {/* Welcome message */}
          <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-4 text-center">
            <p>This is the beginning of your conversation about this course.</p>
            <p className="text-xs mt-1">
              {isStudent 
                ? 'You can ask questions about the course content or request help from the instructor.' 
                : 'You can respond to student questions or provide additional guidance about the course.'}
            </p>
          </div>
          
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${isCurrentUser(message.sender) ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-lg ${
                  isCurrentUser(message.sender)
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                <p
                  className={`text-xs mt-1 text-right ${
                    isCurrentUser(message.sender) ? 'text-blue-200' : 'text-gray-500'
                  }`}
                >
                  {formatTimestamp(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Button 
          type="submit" 
          disabled={!newMessage.trim() || sending}
          className="rounded-full"
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
};

export default ChatInterface;