import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  MessageCircle, 
  Send, 
  Search, 
  Plus, 
  Phone, 
  Video,
  Paperclip,
  Smile,
  MoreVertical
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
  isRead: boolean;
}

interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
}

interface UserSearchResult {
  id: string;
  full_name: string;
  email: string;
  role: string;
  enhanced_role?: string;
}

export default function Messaging() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [allUsers, setAllUsers] = useState<UserSearchResult[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserSearchResult[]>([]);
  const [showUserSearch, setShowUserSearch] = useState(false);

  const [selectedConversation, setSelectedConversation] = useState<string>('1');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'Dr. Sarah Johnson',
      content: 'Good morning! How are things going today?',
      timestamp: '10:15 AM',
      type: 'text',
      isRead: true
    },
    {
      id: '2',
      sender: 'You',
      content: 'Morning! All good here. The 9 AM patient arrived early.',
      timestamp: '10:20 AM',
      type: 'text',
      isRead: true
    },
    {
      id: '3',
      sender: 'Dr. Sarah Johnson',
      content: 'Great! I\'ll be ready in 5 minutes. Patient in room 3 needs consultation when you have a moment.',
      timestamp: '10:30 AM',
      type: 'text',
      isRead: false
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const { profile } = useAuth();

  useEffect(() => {
    fetchAllUsers();
    fetchConversations();
  }, []);

  useEffect(() => {
    if (userSearchTerm.trim()) {
      const filtered = allUsers.filter(user => 
        user.full_name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(userSearchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]);
    }
  }, [userSearchTerm, allUsers]);

  const fetchAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, role')
        .eq('status', 'active')
        .neq('id', profile?.id) // Exclude current user
        .order('full_name');

      if (error) throw error;
      setAllUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  const fetchConversations = async () => {
    try {
      // This would normally fetch from chat_messages table
      // For now, using sample data
      const sampleConversations: Conversation[] = [
        {
          id: '1',
          participant: { id: '1', name: 'Dr. Sarah Johnson', role: 'Dentist' },
          lastMessage: 'Patient in room 3 needs consultation',
          timestamp: '10:30 AM',
          unreadCount: 2,
          isOnline: true
        },
        {
          id: '2',
          participant: { id: '2', name: 'Mike Wilson', role: 'Staff' },
          lastMessage: 'Inventory updated for tomorrow',
          timestamp: '9:45 AM',
          unreadCount: 0,
          isOnline: true
        }
      ];
      setConversations(sampleConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    }
  };

  const startNewConversation = (user: UserSearchResult) => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      participant: {
        id: user.id,
        name: user.full_name,
        role: user.enhanced_role || user.role,
      },
      lastMessage: '',
      timestamp: 'Now',
      unreadCount: 0,
      isOnline: true
    };

    setConversations([newConversation, ...conversations]);
    setSelectedConversation(newConversation.id);
    setMessages([]); // Clear messages for new conversation
    setShowUserSearch(false);
    setUserSearchTerm('');
    toast.success(`Started conversation with ${user.full_name}`);
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: 'You',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      type: 'text',
      isRead: true
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const getCurrentConversation = () => {
    return conversations.find(conv => conv.id === selectedConversation);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="p-6 h-[calc(100vh-120px)] page-container">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Conversations List */}
        <Card className="glass-card card-3d interactive-3d lg:col-span-1">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 float-gentle" />
                Messages
              </CardTitle>
              <Button 
                size="sm" 
                variant="outline" 
                className="btn-3d"
                onClick={() => setShowUserSearch(!showUserSearch)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {showUserSearch && (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users to start new conversation..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  {filteredUsers.length > 0 && (
                    <div className="max-h-40 overflow-y-auto border rounded-lg">
                      {filteredUsers.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => startNewConversation(user)}
                          className="p-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {user.full_name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{user.full_name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                              <Badge variant="outline" className="text-xs mt-1">
                                {user.enhanced_role || user.role}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {conversations.filter(conv => 
                !searchTerm || 
                conv.participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedConversation === conversation.id ? 'bg-muted' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-medical-blue text-white">
                          {conversation.participant.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">
                          {conversation.participant.name}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {conversation.timestamp}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="default" className="ml-2 h-5 min-w-[20px] text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs mt-1">
                        {conversation.participant.role}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className="glass-card card-3d interactive-3d lg:col-span-2 flex flex-col">
          {getCurrentConversation() ? (
            <>
              {/* Chat Header */}
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 float-gentle">
                      <AvatarFallback className="bg-medical-blue text-white">
                        {getCurrentConversation()?.participant.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{getCurrentConversation()?.participant.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {getCurrentConversation()?.participant.role}
                        </Badge>
                        {getCurrentConversation()?.isOnline && (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Online
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="btn-3d">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="btn-3d">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="btn-3d">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <Separator />

              {/* Messages */}
              <CardContent className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${
                        message.sender === 'You' 
                          ? 'bg-medical-blue text-white' 
                          : 'bg-muted'
                      } rounded-lg p-3`}>
                        <p className="text-sm">{message.content}</p>
                        <span className={`text-xs ${
                          message.sender === 'You' ? 'text-white/70' : 'text-muted-foreground'
                        } mt-1 block`}>
                          {message.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <div className="flex-1 relative">
                    <Textarea
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="resize-none min-h-[40px] max-h-[120px] pr-12"
                      rows={1}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    >
                      <Smile className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button 
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="medical-gradient text-white btn-3d"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Conversation</h3>
                <p className="text-muted-foreground">
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}