
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface ChatSettingsProps {
  onClose: () => void;
}

export const ChatSettings = ({ onClose }: ChatSettingsProps) => {
  const [apiKey, setApiKey] = useState("");
  const [apiType, setApiType] = useState<'openai' | 'gemini'>('gemini');
  const [useCustomKey, setUseCustomKey] = useState(false);
  const { toast } = useToast();

  // Load saved API key and type on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('aiApiKey') || "";
    const savedApiType = localStorage.getItem('aiApiType') as 'openai' | 'gemini' || 'gemini';
    setApiKey(savedApiKey);
    setApiType(savedApiType);
    setUseCustomKey(!!savedApiKey);
    
    // Check if API key is set
    if (!savedApiKey) {
      console.log("No custom API key found, will use Supabase Edge Function");
    } else {
      console.log(`Loaded custom API key (${savedApiType}) from localStorage`);
    }
  }, []);

  const saveApiSettings = () => {
    if (useCustomKey && !apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter a valid API key or disable custom API key usage",
        variant: "destructive",
      });
      return;
    }

    if (useCustomKey) {
      localStorage.setItem('aiApiKey', apiKey);
      localStorage.setItem('aiApiType', apiType);
      toast({
        title: "Settings Saved",
        description: `Your ${apiType} API key has been saved`,
      });
    } else {
      // Clear saved API key to use Edge Function
      localStorage.removeItem('aiApiKey');
      localStorage.setItem('aiApiType', apiType);
      toast({
        title: "Settings Saved",
        description: `Using Amokka's ${apiType} API via Supabase`,
      });
    }
    
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
