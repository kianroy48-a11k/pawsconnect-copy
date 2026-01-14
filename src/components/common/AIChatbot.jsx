import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SUGGESTED_PROMPTS = [
  "How often should I feed my puppy?",
  "Tips for training a new kitten",
  "What vaccines does my pet need?"
];

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: "Hi! I'm **Pawly**, your friendly pet assistant! 🐾\n\nI can help you with:\n- Pet care tips\n- Health advice\n- Training suggestions\n- Nutrition guidance\n\nHow can I help you today?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (messageText) => {
    const userMessage = messageText || input.trim();
    if (!userMessage || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are Pawly, a friendly and knowledgeable pet assistant. You help users with pet-related questions about care, health, training, nutrition, behavior, and general pet advice. Be warm, helpful, and use emojis occasionally. Format your responses nicely using markdown (bold, italics, bullet points, etc).

User question: ${userMessage}

Provide a helpful, accurate, and friendly response. If the question is not pet-related, kindly redirect the conversation to pet topics.`,
        add_context_from_internet: true
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('AI error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment! 🐾" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedPrompt = (prompt) => {
    handleSend(prompt);
  };

  const showSuggestions = messages.length === 1 && !isLoading;

  return (
    <TooltipProvider>
      <div className="fixed bottom-4 right-4 z-50 md:bottom-6 md:right-6">
        {/* Chat Window */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 w-[340px] sm:w-[380px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-100 to-sky-100 px-4 py-3 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-sky-400 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">Pawly</h3>
                  <p className="text-xs text-gray-500">Your Pet Assistant</p>
                </div>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 rounded-full hover:bg-white/50"
                    aria-label="Close chat"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Close chat</TooltipContent>
              </Tooltip>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex",
                    msg.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                      msg.role === 'user'
                        ? "chat-bubble-user text-gray-800"
                        : "chat-bubble-ai text-gray-800"
                    )}
                  >
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown
                        className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                          li: ({ children }) => <li className="mb-1">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                          em: ({ children }) => <em className="italic">{children}</em>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Suggested Prompts */}
              {showSuggestions && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 text-center">Try asking:</p>
                  {SUGGESTED_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestedPrompt(prompt)}
                      className="w-full text-left px-3 py-2 bg-white rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-blue-50 hover:border-blue-200 transition"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="chat-bubble-ai rounded-2xl px-4 py-3">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-100 bg-white">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about pets..."
                  disabled={isLoading}
                  className="flex-1 rounded-full border-gray-200 bg-gray-50 focus:bg-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Type your message"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => handleSend()}
                      disabled={!input.trim() || isLoading}
                      className="rounded-full bg-gradient-to-r from-blue-400 to-sky-400 hover:from-blue-500 hover:to-sky-500 h-9 w-9 p-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Send message"
                    >
                      <Send className="w-4 h-4 text-white" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Send message</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        )}

        {/* Toggle Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "h-14 w-14 rounded-full shadow-lg transition-all",
                isOpen 
                  ? "bg-gray-100 hover:bg-gray-200" 
                  : "bg-gradient-to-r from-blue-400 to-sky-400 hover:from-blue-500 hover:to-sky-500"
              )}
              aria-label={isOpen ? "Close Pawly chat" : "Open Pawly chat"}
            >
              {isOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <MessageCircle className="w-6 h-6 text-white" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            {isOpen ? "Close Pawly" : "Chat with Pawly"}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}