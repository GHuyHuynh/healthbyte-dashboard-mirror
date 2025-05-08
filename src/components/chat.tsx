'use client';

import { Card } from "@/components/ui/card"
import { type CoreMessage } from 'ai';
import { useState, useRef, useEffect } from 'react';
import { dualResponseConversation } from '@/app/actions';
import { readStreamableValue } from 'ai/rsc';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { IconArrowUp } from "@/components/ui/icons";
import AboutCard from "@/components/cards/aboutcard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2, CircleStop } from "lucide-react";

export const maxDuration = 60;

export type Persona = {
  persona_id: number
  name: string
  took_covid_vaccine: boolean
  description: string
  demographics: {
    age: number
    gender: string
    location: string
    occupation: string
    education: string
  }
  grounding_notes: string
  personality: { archetype: string; notes: string }
  beliefs_and_attitudes: Record<string, any>
  articles_read: string[]
}

interface ChatProps {
  persona: Persona
}

export default function Chat({ persona }: ChatProps) {
  const [messages, setMessages] = useState<CoreMessage[]>([]);
  const [response1Messages, setResponse1Messages] = useState<CoreMessage[]>([]);
  const [response2Messages, setResponse2Messages] = useState<CoreMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResponse1Loading, setIsResponse1Loading] = useState(false);
  const [isResponse2Loading, setIsResponse2Loading] = useState(false);
  const [error, setError] = useState<{ message: string; reset?: number } | null>(null);
  const [rateLimit, setRateLimit] = useState<{ remaining: number; reset: number } | null>(null);
  
  // Add refs for the chat containers
  const chatContainer1Ref = useRef<HTMLDivElement>(null);
  const chatContainer2Ref = useRef<HTMLDivElement>(null);

  const displayName = persona.name.split(' ')[0]
  const backHref = `/persona/${persona.persona_id}`;

  // Auto-scroll when messages update
  useEffect(() => {
    if (chatContainer1Ref.current) {
      chatContainer1Ref.current.scrollTop = chatContainer1Ref.current.scrollHeight;
    }
    if (chatContainer2Ref.current) {
      chatContainer2Ref.current.scrollTop = chatContainer2Ref.current.scrollHeight;
    }
  }, [response1Messages, response2Messages]);

  const conversationStarters = [
    `What's your opinion about the COVID-19 vaccine, ${displayName}?`,
    `Is the COVID-19 vaccine safe in your view, ${displayName}?`,
    `Should I get vaccinated, ${displayName}?`,
    `What do you think about the vaccine rollout, ${displayName}?`
  ];

  const handleSubmit = async (e: React.FormEvent | null, suggestedInput?: string) => {
    if (e) e.preventDefault();
    
    const messageText = suggestedInput || input;
    if (!messageText.trim() || isLoading) return;
    
    setIsLoading(true);
    setIsResponse1Loading(true);
    setIsResponse2Loading(true);
    setError(null);
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
      const result = await dualResponseConversation(newMessages, persona);
      
      if (result.error) {
        // Handle rate limit error
        setError({
          message: result.message || 'An error occurred while processing your message. Please try again.',
          reset: result.reset
        });
        
        // Store rate limit info even when error occurs
        if (result.remaining !== undefined && result.reset) {
          setRateLimit({
            remaining: result.remaining,
            reset: result.reset
          });
        }
        
        return;
      }
      
      // Store rate limit info on successful request
      if (result.remaining !== undefined && result.reset) {
        setRateLimit({
          remaining: result.remaining,
          reset: result.reset
        });
      }
      
      // Create placeholder for assistant responses
      setResponse1Messages([...newResponse1Messages, { role: 'assistant', content: '' }]);
      setResponse2Messages([...newResponse2Messages, { role: 'assistant', content: '' }]);
      
      // Handle first response stream
      const processStream1 = async () => {
        let accumulatedContent1 = '';
        if (result.response1) {
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
            // Scroll to bottom during streaming
            if (chatContainer1Ref.current) {
              chatContainer1Ref.current.scrollTop = chatContainer1Ref.current.scrollHeight;
            }
          }
        }

        // Process loading state for response 1
        if (result.loading1State) {
          for await (const loadingState of readStreamableValue(result.loading1State)) {
            if (loadingState) {
              setIsResponse1Loading(loadingState.loading);
            }
          }
        }
      };
      
      // Handle second response stream
      const processStream2 = async () => {
        let accumulatedContent2 = '';
        if (result.response2) {
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
            // Scroll to bottom during streaming
            if (chatContainer2Ref.current) {
              chatContainer2Ref.current.scrollTop = chatContainer2Ref.current.scrollHeight;
            }
          }
        }

        // Process loading state for response 2
        if (result.loading2State) {
          for await (const loadingState of readStreamableValue(result.loading2State)) {
            if (loadingState) {
              setIsResponse2Loading(loadingState.loading);
            }
          }
        }
      };
      
      // Process both streams simultaneously
      await Promise.all([processStream1(), processStream2()]);
    } catch (error) {
      console.error('Error processing chat:', error);
      setError({ message: 'An error occurred while processing your message. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleSubmit(null, suggestion);
  };

  // Format time until reset
  const formatTimeUntilReset = () => {
    if (!rateLimit?.reset) return '';
    
    const now = Date.now();
    const resetTime = rateLimit.reset;
    const diffInSeconds = Math.max(0, Math.ceil((resetTime - now) / 1000));
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      const seconds = diffInSeconds % 60;
      return `${minutes}m ${seconds}s`;
    } else {
      const hours = Math.floor(diffInSeconds / 3600);
      const minutes = Math.floor((diffInSeconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  };
  
  // Check if the user has hit the rate limit
  const hasHitRateLimit = rateLimit ? rateLimit.remaining <= 0 : false;

  // Periodically update the timer display
  useEffect(() => {
    if (!rateLimit?.reset) return;
    
    const interval = setInterval(() => {
      // Force re-render to update the timer
      setRateLimit(prev => prev ? {...prev} : null);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [rateLimit?.reset]);

  return (    
    <div className="group w-full overflow-auto">
      <div className="absolute top-4 left-4 z-10">
        <Button variant="outline" size="sm" asChild>
          <Link href={backHref}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {displayName}
          </Link>
        </Button>
      </div>

      {messages.length <= 0 ? ( 
        <AboutCard persona={persona} />  
      ) 
      : (
        <div className="flex flex-col md:flex-row gap-4 mt-10 mb-24 mx-auto max-w-7xl px-4 h-[calc(100vh-180px)]">
          {/* First Response Area */}
          <div className="flex-1 border rounded-lg p-4 overflow-y-auto h-full" ref={chatContainer1Ref}>
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
          <div className="flex-1 border-2 border-orange-200 rounded-lg p-4 overflow-y-auto h-full bg-orange-50/30" ref={chatContainer2Ref}>
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
          {messages.length === 0 && !hasHitRateLimit && (
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
          
          {rateLimit && (
            <div className="mb-2 text-center">
              <div className={`py-1 px-2 ${hasHitRateLimit ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'} rounded-md inline-flex items-center text-xs`}>
                <span className="font-medium">{rateLimit.remaining} request{rateLimit.remaining !== 1 ? 's' : ''} left</span>
                <span className="mx-1">•</span>
                <span>Reset in {formatTimeUntilReset()}</span>
              </div>
            </div>
          )}
          
          {hasHitRateLimit && (
            <div className="mb-2">
              <Alert variant="destructive" className="py-2">
                <AlertTitle className="text-sm">Rate limit exceeded</AlertTitle>
                <AlertDescription className="text-xs">
                  You've reached the maximum number of requests. Please wait {formatTimeUntilReset()} before trying again.
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          <div className="p-2 w-full h-16 bg-white rounded-lg border border-gray-200">
            <form onSubmit={(e) => handleSubmit(e)}>
              <div className="flex">
                <div className="relative w-[95%] mr-2">
                  <Input
                    type="text"
                    value={input}
                    onChange={event => {
                      setInput(event.target.value);
                    }}
                    disabled={isLoading || hasHitRateLimit}
                    autoComplete="off"
                    className="w-full shadow-none focus-visible:ring-0 focus-visible:outline-none focus:outline-none focus:ring-0 ring-0 focus-visible:border-none border-transparent focus:border-transparent focus-visible:ring-none disabled:opacity-50 pr-10"
                    placeholder={hasHitRateLimit ? `Try again in ${formatTimeUntilReset()}` : `Ask ${displayName}`}
                  />
                  {isLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex">
                      {isResponse1Loading && (
                        <div className="h-5 w-5 rounded-full bg-sky-100 flex items-center justify-center mr-1">
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-800" />
                        </div>
                      )}
                      {isResponse2Loading && (
                        <div className="h-5 w-5 rounded-full bg-orange-100 flex items-center justify-center">
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-orange-800" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <Button disabled={!input.trim() || isLoading || hasHitRateLimit}>
                  {isLoading ? (
                    <CircleStop />
                  ) : (
                    <IconArrowUp />
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}