import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Message } from '../types/coordinator';

interface ChatPanelProps {
  messages: Message[];
  isProcessing: boolean;
  onSendMessage: (message: string) => void;
  onDriverDelayInquiry: (customerId: string, message: string) => void;
}

export const ChatPanel = ({ 
  messages, 
  isProcessing, 
  onSendMessage,
  onDriverDelayInquiry 
}: ChatPanelProps) => {
  const [inputValue, setInputValue] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isProcessing) {
      // Check if this is a driver delay inquiry
      const lowerMessage = inputValue.toLowerCase();
      const isDelayInquiry = lowerMessage.includes('where is my driver') || 
                            lowerMessage.includes('driver is late') ||
                            lowerMessage.includes('driver delay');
      
      if (isDelayInquiry) {
        onDriverDelayInquiry('customer_123', inputValue);
      } else {
        onSendMessage(inputValue);
      }
      setInputValue('');
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const quickActions = [
    { text: "Where is my driver?", delay: true },
    { text: "My driver is 20 minutes late", delay: true },
    { text: "What's the status of my order?", delay: false },
    { text: "I need to change my delivery address", delay: false }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">AI Coordinator Agent</h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse-soft"></div>
                <span className="text-sm text-muted-foreground">Online</span>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {messages.length} Messages
          </Badge>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender === 'user' 
                    ? 'message-user shadow-smooth' 
                    : 'message-agent shadow-smooth'
                }`}>
                  <div className="flex items-start space-x-2">
                    {message.sender === 'agent' && (
                      <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    )}
                    {message.sender === 'user' && (
                      <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      {message.actions && message.actions.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {message.actions.map((action, index) => (
                            <div key={index} className="text-xs opacity-75 flex items-center space-x-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>{action}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs opacity-60">
                          {formatTimestamp(message.timestamp)}
                        </span>
                        {message.priority && (
                          <Badge variant="destructive" className="text-xs">
                            {message.priority.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="message-agent shadow-smooth max-w-[80%] p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                  </div>
                  <span className="text-sm">Processing...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      <div className="p-2 border-t border-border bg-muted/20">
        <div className="flex flex-wrap gap-2 mb-2">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="text-xs h-7 hover-scale"
              onClick={() => {
                if (action.delay) {
                  onDriverDelayInquiry('customer_123', action.text);
                } else {
                  onSendMessage(action.text);
                }
              }}
              disabled={isProcessing}
            >
              {action.delay && <AlertTriangle className="w-3 h-3 mr-1" />}
              {action.text}
            </Button>
          ))}
        </div>
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-card">
        <div className="flex space-x-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Describe the delivery issue..."
            disabled={isProcessing}
            className="flex-1 transition-all duration-200 focus:shadow-glow"
          />
          <Button 
            type="submit" 
            disabled={!inputValue.trim() || isProcessing}
            className="gradient-primary hover:shadow-glow transition-all duration-200 active-scale"
            size="sm"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};