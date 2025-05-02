'use client';

import { Card } from "@/components/ui/card"
import { type CoreMessage } from 'ai';
import { useState } from 'react';
import { dualResponseConversation } from '@/app/actions';
import { readStreamableValue } from 'ai/rsc';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { IconArrowUp } from "@/components/ui/icons";
import AboutCard from "@/components/cards/aboutcard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const maxDuration = 60;

export default function Chat() {
  const [messages, setMessages] = useState<CoreMessage[]>([]);
  const [response1Messages, setResponse1Messages] = useState<CoreMessage[]>([]);
  const [response2Messages, setResponse2Messages] = useState<CoreMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const conversationStarters = [
    "What's your opinion about the COVID-19 vaccine?",
    "Is the COVID-19 vaccine safe?",
    "Should I get vaccinated?",
    "What do you think about the vaccine rollout?"
  ];

  const handleSubmit = async (e: React.FormEvent | null, suggestedInput?: string) => {
    if (e) e.preventDefault();
    
    const messageText = suggestedInput || input;
    if (!messageText.trim() || isLoading) return;
    
    setIsLoading(true);
    const userMessage = { content: messageText, role: 'user' as const };
    
    const newMessages: CoreMessage[] = [
      ...messages,
      userMessage,
    ];
    setMessages(newMessages);
    
    // Add user message to both response arrays
    const newResponse1Messages = [...response1Messages, userMessage];
    const newResponse2Messages = [...response2Messages, userMessage];
    
    setResponse1Messages(newResponse1Messages);
    setResponse2Messages(newResponse2Messages);
    
    setInput('');
    
    try {
      const result = await dualResponseConversation(newMessages);
      
      // Create placeholder for assistant responses
      setResponse1Messages([...newResponse1Messages, { role: 'assistant', content: '' }]);
      setResponse2Messages([...newResponse2Messages, { role: 'assistant', content: '' }]);
      
      // Handle first response stream
      const processStream1 = async () => {
        let accumulatedContent1 = '';
        for await (const chunk of readStreamableValue(result.response1)) {
          accumulatedContent1 = chunk as string;
          setResponse1Messages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { 
              role: 'assistant', 
              content: accumulatedContent1 
            };
            return newMessages;
          });
        }
      };
      
      // Handle second response stream
      const processStream2 = async () => {
        let accumulatedContent2 = '';
        for await (const chunk of readStreamableValue(result.response2)) {
          accumulatedContent2 = chunk as string;
          setResponse2Messages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { 
              role: 'assistant', 
              content: accumulatedContent2 
            };
            return newMessages;
          });
        }
      };
      
      // Process both streams simultaneously
      await Promise.all([processStream1(), processStream2()]);
    } catch (error) {
      console.error('Error processing chat:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleSubmit(null, suggestion);
  };
  
  return (    
    <div className="group w-full overflow-auto">
      <div className="absolute top-4 left-4 z-10">
        <Button variant="outline" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </Button>
      </div>

      {messages.length <= 0 ? ( 
        <AboutCard />  
      ) 
      : (
        <div className="flex flex-col md:flex-row gap-4 mt-10 mb-24 mx-auto max-w-7xl px-4 h-[calc(100vh-180px)]">
          {/* First Response Area */}
          <div className="flex-1 border rounded-lg p-4 overflow-y-auto h-full">
            <div className="p-2 bg-sky-50 rounded-md mb-4 flex items-center justify-center">
              <h2 className="text-lg font-semibold text-blue-800">Before Exposure</h2>
            </div>
            <div className="space-y-4">
              {response1Messages.map((message, index) => (
                <div key={index} className="whitespace-pre-wrap flex">
                  <div className={`${message.role === 'user' ? 'bg-gray-100 ml-auto' : 'bg-transparent'} p-2 rounded-lg w-full ${message.role === 'user' ? 'text-right' : ''}`}>
                    {message.content as string}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Second Response Area */}
          <div className="flex-1 border-2 border-orange-200 rounded-lg p-4 overflow-y-auto h-full bg-orange-50/30">
            <div className="p-2 bg-orange-100 rounded-md mb-4 flex items-center justify-center">
              <h2 className="text-lg font-semibold text-orange-800">After Exposure to Fake News</h2>
            </div>
            <div className="space-y-4">
              {response2Messages.map((message, index) => (
                <div key={index} className="whitespace-pre-wrap flex">
                  <div className={`${message.role === 'user' ? 'bg-gray-100 ml-auto' : 'bg-transparent'} p-2 rounded-lg w-full ${message.role === 'user' ? 'text-right' : ''}`}>
                    {message.content as string}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="fixed inset-x-0 bottom-10 w-full">
        <div className="w-full max-w-xl mx-auto">
          {messages.length === 0 && (
            <div className="mb-4">
              <Card className="p-2 cursor-pointer transition-colors duration-200">
                <div className="text-sm text-gray-600 font-medium ">Try asking:</div>
                <div className="space-y-2">
                  {conversationStarters.map((starter, index) => (
                    <div 
                      key={index} 
                      className="p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors duration-200" 
                      onClick={() => handleSuggestionClick(starter)}
                    >
                      {starter}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
          <Card className="p-2">
            <form onSubmit={(e) => handleSubmit(e)}>
              <div className="flex">
                <Input
                  type="text"
                  value={input}
                  onChange={event => {
                    setInput(event.target.value);
                  }}
                  autoComplete="off"
                  className="w-[95%] mr-2 border-0 ring-offset-0 focus-visible:ring-0 focus-visible:outline-none focus:outline-none focus:ring-0 ring-0 focus-visible:border-none border-transparent focus:border-transparent focus-visible:ring-none"
                  placeholder='Ask David'
                />
                <Button disabled={!input.trim() || isLoading}>
                  <IconArrowUp />
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}