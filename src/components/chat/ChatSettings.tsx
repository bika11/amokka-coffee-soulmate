
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useChat } from "@/contexts/ChatContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
        
        <Alert variant="warning" className="mb-3">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            The Supabase Edge Function may not be properly configured. If you experience errors, please use your own API key.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-2 border rounded-md p-3 bg-muted/20">
          <label className="text-sm font-medium">AI Model</label>
          <RadioGroup 
            value={apiType} 
            onValueChange={(value) => setApiType(value as 'openai' | 'gemini')}
            className="flex flex-col space-y-2 pt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="gemini" id="gemini" />
              <Label htmlFor="gemini" className="cursor-pointer">Google Gemini (Recommended)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="openai" id="openai" />
              <Label htmlFor="openai" className="cursor-pointer">OpenAI</Label>
            </div>
          </RadioGroup>
          <p className="text-xs text-muted-foreground mt-1">
            {apiType === 'openai' ? 
              "Note: OpenAI may not be configured on the server. If you get errors, switch to Gemini or use your own API key." :
              "Gemini is the recommended model for the coffee chatbot."}
          </p>
        </div>
        
        <div className="flex items-center space-x-2 py-2">
          <Switch
            id="useCustomKey"
            checked={useCustomKey}
            onCheckedChange={setUseCustomKey}
          />
          <Label htmlFor="useCustomKey" className="cursor-pointer">
            Use my own API key
          </Label>
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
            <p className="text-xs text-muted-foreground mt-1">
              Your API key is stored locally in your browser and never sent to our servers.
            </p>
          </div>
        )}
        
        {!useCustomKey && (
          <div className="space-y-2">
            <Alert variant="info" className="bg-blue-50">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Using Amokka's {apiType} API via Supabase Edge Function. No authentication required.
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        <Button onClick={saveApiSettings} className="w-full mt-2">
          Save Settings
        </Button>
      </div>
    </div>
  );
};
