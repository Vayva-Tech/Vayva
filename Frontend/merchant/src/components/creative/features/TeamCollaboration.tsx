'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  FileText, 
  Download,
  MoreVertical,
  Search,
  Phone,
  Video,
  Smile,
  Check,
  CheckCheck
} from 'lucide-react';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  status: 'online' | 'busy' | 'offline';
  lastSeen?: Date;
}

interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  attachments?: Array<{ name: string; type: string; url: string }>;
  read: boolean;
}

interface ChatChannel {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'project';
  members: string[]; // member IDs
  lastMessage?: string;
  unreadCount: number;
}

export default function TeamCollaboration() {
  const [activeChannel, setActiveChannel] = useState<string>('1');
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - in production, this would come from real-time database
  const teamMembers: TeamMember[] = [
    { id: '1', name: 'Sarah Chen', role: 'Designer', status: 'online' },
    { id: '2', name: 'Mike Rodriguez', role: 'Developer', status: 'busy' },
    { id: '3', name: 'Jessica Park', role: 'Project Manager', status: 'online' },
    { id: '4', name: 'Alex Kim', role: 'Developer', status: 'offline', lastSeen: new Date('2024-03-10') },
  ];

  const channels: ChatChannel[] = [
    { id: '1', name: 'General', type: 'group', members: ['1', '2', '3', '4'], lastMessage: 'Meeting at 3pm today', unreadCount: 2 },
    { id: '2', name: 'Design Team', type: 'group', members: ['1', '3'], lastMessage: 'New mockups uploaded', unreadCount: 0 },
    { id: '3', name: 'Acme Corp Project', type: 'project', members: ['1', '2', '3'], lastMessage: 'Client approved the design', unreadCount: 5 },
    { id: '4', name: 'Sarah Chen', type: 'direct', members: ['1'], lastMessage: 'Can you review this?', unreadCount: 1 },
  ];

  const messages: Record<string, ChatMessage[]> = {
    '1': [
      { id: '1', senderId: '1', text: 'Good morning everyone!', timestamp: new Date('2024-03-11T09:00:00'), read: true },
      { id: '2', senderId: '2', text: 'Morning! Ready for the standup?', timestamp: new Date('2024-03-11T09:05:00'), read: true },
      { id: '3', senderId: '3', text: 'Yes! Meeting at 3pm today to review the Acme project', timestamp: new Date('2024-03-11T09:10:00'), read: false },
      { id: '4', senderId: '1', text: 'Perfect, I\'ll prepare the presentation', timestamp: new Date('2024-03-11T09:15:00'), read: false },
    ],
    '2': [
      { id: '1', senderId: '1', text: 'Hey Jessica, check out these new mockups', timestamp: new Date('2024-03-11T10:00:00'), read: true },
      { id: '2', senderId: '3', text: 'Looks great! Just left some feedback', timestamp: new Date('2024-03-11T10:30:00'), read: true },
    ],
    '3': [],
    '4': [],
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    toast.success('Message sent');
    setMessageInput('');
    // In production: send to backend/websocket
  };

  const handleFileUpload = () => {
    toast.info('File upload dialog coming soon');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      online: 'bg-green-500',
      busy: 'bg-red-500',
      offline: 'bg-gray-500',
    };
    return colors[status];
  };

  const currentChannel = channels.find(c => c.id === activeChannel);
  const currentMessages = messages[activeChannel] || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
      {/* Sidebar - Channels */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Channels</CardTitle>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-350px)]">
            <div className="space-y-2">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setActiveChannel(channel.id)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    activeChannel === channel.id
                      ? 'bg-green-500 text-white'
                      : 'hover:bg-green-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {channel.type === 'direct' ? (
                        <Avatar className="h-6 w-6">
                          <AvatarFallback>{teamMembers.find(m => m.id === channel.members[0])?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      ) : (
                        <MessageSquare className="h-6 w-6" />
                      )}
                      <span className="font-medium text-sm">{channel.name}</span>
                    </div>
                    {channel.unreadCount > 0 && (
                      <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                        {channel.unreadCount}
                      </Badge>
                    )}
                  </div>
                  {channel.lastMessage && (
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {channel.lastMessage}
                    </p>
                  )}
                </button>
              ))}
            </div>

            {/* Team Members Online */}
            <div className="mt-6">
              <h3 className="text-xs font-semibold text-gray-500 mb-2 px-3">
                TEAM MEMBERS
              </h3>
              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <button
                    key={member.id}
                    className="w-full p-2 rounded-lg hover:bg-green-50 flex items-center gap-3"
                  >
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(member.status)}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Main Chat Area */}
      <Card className="lg:col-span-3">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <CardTitle className="text-lg">{currentChannel?.name}</CardTitle>
                <CardDescription>
                  {currentChannel?.type === 'direct' ? 'Direct Message' : `${currentChannel?.members.length} members`}
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col h-[calc(100vh-400px)]">
          {/* Messages */}
          <ScrollArea className="flex-1 mb-4 pr-4">
            <div className="space-y-4">
              {currentMessages.map((message) => {
                const sender = teamMembers.find(m => m.id === message.senderId);
                return (
                  <div key={message.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{sender?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{sender?.name}</span>
                        <span className="text-xs text-gray-500">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <p className="text-sm">{message.text}</p>
                        {message.attachments && (
                          <div className="mt-2 space-y-2">
                            {message.attachments.map((attachment, idx) => (
                              <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded">
                                {attachment.type.startsWith('image') ? (
                                  <ImageIcon className="h-4 w-4" />
                                ) : (
                                  <FileText className="h-4 w-4" />
                                )}
                                <span className="text-sm">{attachment.name}</span>
                                <Button variant="ghost" size="sm" className="ml-auto">
                                  <Download className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {message.read ? (
                          <CheckCheck className="h-3 w-3" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )}
                        <span>{message.read ? 'Read' : 'Sent'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="border-t pt-4">
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleFileUpload}>
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button variant="ghost" size="sm">
                <Smile className="h-4 w-4" />
              </Button>
              <Button onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
