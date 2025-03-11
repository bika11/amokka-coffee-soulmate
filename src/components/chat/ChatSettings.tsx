
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useChat } from "@/contexts/ChatContext";

interface ChatSettingsProps {
  onClose: () => void;
}

export const ChatSettings = ({ onClose }: ChatSettingsProps) => {
  const { apiSettings, updateApiSettings } = useChat();
  const [apiKey, setApiKey] = useState(apiSettings.apiKey);
  const [apiType, setApiType] = useState<'openai' | 'gemini'>(apiSettings.apiType);
  const [useCustomKey, setUseCustomKey] = useState(apiSettings.useCustomKey);
  const { toast } = useToast();

  // Update local state when context changes
  useEffect(() => {
    setApiKey(apiSettings.apiKey);
    setApiType(apiSettings.apiType);
    setUseCustomKey(apiSettings.useCustomKey);
  }, [apiSettings]);

  const saveApiSettings = () => {
    if (useCustomKey && !apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter a valid API key or disable custom API key usage",
        variant: "destructive",
      });
      return;
    }

    updateApiSettings({
      apiKey,
      apiType,
      useCustomKey
    });
    
    toast({
      title: "Settings Saved",
      description: useCustomKey 
        ? `Your ${apiType} API key has been saved` 
        : `Using Amokka's ${apiType} API via Supabase`,
    });
    
    onClose();
  };

  return (
    <div className="flex-1 p-4 space-y-4">
      <div className="space-y-3">
        <h3 className="font-medium">AI Settings</h3>
        
        <div className="space-y-2">
          <label className="text-sm">AI Model</label>
          <select 
            className="w-full p-2 border rounded-md"
            value={apiType}
            onChange={(e) => setApiType(e.target.value as 'openai' | 'gemini')}
          >
            <option value="gemini">Google Gemini</option>
            <option value="openai">OpenAI</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="useCustomKey"
            checked={useCustomKey}
            onChange={(e) => setUseCustomKey(e.target.checked)}
            className="rounded border-gray-300"
          />
          <label htmlFor="useCustomKey" className="text-sm">
            Use my own API key
          </label>
        </div>
        
        {useCustomKey && (
          <div className="space-y-1">
            <label className="text-sm">Your API Key</label>
            <Input
              type="password"
              placeholder={`Enter your ${apiType} API key`}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
        )}
        
        {!useCustomKey && (
          <p className="text-xs text-gray-500 italic">
            Using Amokka's {apiType} API via Supabase
          </p>
        )}
        
        <Button onClick={saveApiSettings} className="w-full mt-2">
          Save Settings
        </Button>
      </div>
    </div>
  );
};
