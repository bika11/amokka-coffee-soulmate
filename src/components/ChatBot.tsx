
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Settings, X } from "lucide-react";
import { ChatMessage } from "./chat/ChatMessage";
import { ChatInput } from "./chat/ChatInput";
import { ChatHeader } from "./chat/ChatHeader";
import { ChatButton } from "./chat/ChatButton";
import { LoadingDots } from "./chat/LoadingDots";
import { Message } from "@/interfaces/ai-client.interface";
import { createAIClient } from "@/services/ai-client.factory";

export const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [apiType, setApiType] = useState<'openai' | 'gemini'>('gemini'); // Default to Gemini
  const { toast } = useToast();

  // Load saved API key and type on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('aiApiKey') || "";
    const savedApiType = localStorage.getItem('aiApiType') as 'openai' | 'gemini' || 'gemini';
    setApiKey(savedApiKey);
    setApiType(savedApiType);
    
    // Check if API key is set
    if (!savedApiKey) {
      console.log("No API key found in localStorage");
    } else {
      console.log(`Loaded API key (${savedApiType}) from localStorage`);
    }
  }, []);

  const handleToggleChat = () => {
    if (!isOpen) {
      setMessages([
        {
          content: "Hello! I'm your Amokka Coffee expert. Ask me anything about our delicious coffees!",
          role: "assistant",
        },
      ]);
    }
    setIsOpen(!isOpen);
  };

  const saveApiSettings = () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('aiApiKey', apiKey);
    localStorage.setItem('aiApiType', apiType);
    
    toast({
      title: "Settings Saved",
      description: `Your ${apiType} API key has been saved`,
    });
    
    setShowSettings(false);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Check if API key is configured
    const savedApiKey = localStorage.getItem('aiApiKey');
    if (!savedApiKey) {
      toast({
        title: "API Key Required",
        description: "Please configure an API key in the settings",
        variant: "destructive",
      });
      setShowSettings(true);
      return;
    }

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { content: userMessage, role: "user" }]);
    setIsLoading(true);

    try {
      // Use the saved API key and type
      const savedApiType = localStorage.getItem('aiApiType') as 'openai' | 'gemini' || 'gemini';
      console.log(`Using ${savedApiType} API for chat completion`);
      
      const aiClient = createAIClient(savedApiType, savedApiKey);

      const updatedMessages = [
        ...messages,
        { content: userMessage, role: "user" as const }
      ];

      console.log("Sending message to AI client", {
        messageCount: updatedMessages.length,
        apiType: savedApiType
      });

      const response = await aiClient.getCompletion(updatedMessages);

      setMessages((prev) => [
        ...prev,
        { content: response, role: "assistant" },
      ]);
    } catch (error) {
      console.error("Error getting response:", error);
      toast({
        title: "Error",
        description: error instanceof Error 
          ? error.message 
          : "I apologize, but I'm having trouble responding right now. Please check your API key configuration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute bottom-4 right-4">
      {isOpen ? (
        <Card className="w-80 h-96 flex flex-col shadow-lg animate-fade-in">
          <ChatHeader onClose={handleToggleChat}>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowSettings(!showSettings)}
              className="h-8 w-8"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </ChatHeader>
          
          {showSettings ? (
            <div className="flex-1 p-4 space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">AI Settings</h3>
                <div className="space-y-1">
                  <label className="text-sm">API Type</label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={apiType}
                    onChange={(e) => setApiType(e.target.value as 'openai' | 'gemini')}
                  >
                    <option value="gemini">Google Gemini</option>
                    <option value="openai">OpenAI</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm">API Key</label>
                  <Input
                    type="password"
                    placeholder={`Enter your ${apiType} API key`}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                </div>
                <Button onClick={saveApiSettings} className="w-full">
                  Save Settings
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <ChatMessage key={index} content={message.content} isUser={message.role === "user"} />
                ))}
                {isLoading && <LoadingDots />}
              </div>
              <ChatInput
                input={input}
                setInput={setInput}
                handleSendMessage={handleSendMessage}
                isLoading={isLoading}
              />
            </>
          )}
        </Card>
      ) : (
        <ChatButton onClick={handleToggleChat} isBouncing={false} />
      )}
    </div>
  );
};
