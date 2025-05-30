
import { getCoffeeContext, optimizeContext } from "./context-builder.ts";
import { formatPromptWithContext } from "./prompt-manager.ts";
import { ChatCompletionRequestMessage } from "./types.ts";
import { ChatError } from "./error-handler.ts";
import { AIService } from "./ai-service.ts";
import { CacheService } from "./cache-service.ts";

/**
 * Handles processing chat requests and returning responses
 */
export class RequestHandler {
  private aiService: AIService;
  private cacheService: CacheService;

  constructor() {
    this.aiService = new AIService();
    this.cacheService = new CacheService();
  }

  /**
   * Process a chat request and return a response
   */
  async handleRequest(requestData: any): Promise<any> {
    const { 
      messages, 
      model = 'gemini', 
      temperature = 0.7, 
      maxTokens,
      promptId = 'coffee-expert'
    } = requestData;
    
    if (!messages || !Array.isArray(messages)) {
      console.error("Invalid request format: messages array is required");
      throw new ChatError("Invalid request format: messages array is required", 400);
    }

    // Validate messages array content
    for (const message of messages) {
      if (!message || typeof message !== 'object' || typeof message.role !== 'string' || typeof message.content !== 'string') {
        console.error("Invalid request format: each message must have a string role and string content");
        throw new ChatError("Invalid request format: each message must have a string role and string content", 400);
      }
    }
    
    // Validate model
    if (typeof model !== 'string' || (model !== 'gemini' && model !== 'openai')) {
      console.error("Invalid request format: model must be 'gemini' or 'openai'");
      throw new ChatError("Invalid request format: model must be 'gemini' or 'openai'", 400);
    }

    // Validate temperature
    if (typeof temperature !== 'number' || temperature < 0 || temperature > 1) {
      console.error("Invalid request format: temperature must be a number between 0 and 1");
      throw new ChatError("Invalid request format: temperature must be a number between 0 and 1", 400);
    }

    // Validate maxTokens
    if (maxTokens !== undefined && (typeof maxTokens !== 'number' || maxTokens <= 0)) {
      console.error("Invalid request format: maxTokens must be a positive number");
      throw new ChatError("Invalid request format: maxTokens must be a positive number", 400);
    }

    // Validate promptId
    if (typeof promptId !== 'string') {
      console.error("Invalid request format: promptId must be a string");
      throw new ChatError("Invalid request format: promptId must be a string", 400);
    }

    // Further validation could include:
    // - Checking the length of messages to prevent excessively large requests
    // - Sanitizing the content of messages to prevent potential injection attacks
    // - Validating the format of promptId against a known list of valid prompt IDs

    console.log(`Processing request with ${messages.length} messages, using model: ${model}`);
    
    // Check for requested model availability
    const requestedModelAvailable = this.aiService.isModelAvailable(model);
    
    if (!requestedModelAvailable) {
      console.error(`${model} API key not configured`);
      
      // Try to find a fallback model
      const fallbackModel = this.aiService.getFallbackModel(model);
      
      if (fallbackModel) {
        console.log(`Falling back to ${fallbackModel} model since ${model} API key is not configured`);
        return this.processRequest(messages, fallbackModel, temperature, maxTokens, promptId);
      }
      
      throw new ChatError(`${model} API key not configured and no fallback available`, 401);
    }
    
    return this.processRequest(messages, model, temperature, maxTokens, promptId);
  }

  /**
   * Process the request with all context and caching logic
   */
  private async processRequest(
    messages: ChatCompletionRequestMessage[], 
    model: string, 
    temperature: number, 
    maxTokens?: number,
    promptId: string = 'coffee-expert'
  ): Promise<any> {
    // Check cache first for exact message combination
    const cacheKey = this.cacheService.generateCacheKey(messages, model, promptId);
    const cachedResponse = this.cacheService.get(cacheKey);
    
    if (cachedResponse) {
      console.log("Returning cached response");
      return cachedResponse;
    }
    
    try {
      // Get coffee context for product information
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (!supabaseUrl || !supabaseKey) {
        throw new ChatError("Missing Supabase configuration", 500);
      }
      
      const coffeeContext = await getCoffeeContext(supabaseUrl, supabaseKey);
      
      // Get system prompt from prompt manager
      const systemPrompt = formatPromptWithContext(promptId, coffeeContext);
      
      // Optimize context if needed
      const optimizedPrompt = optimizeContext(systemPrompt, 2000);
      
      // Prepare messages with system prompt
      const systemMessageExists = messages.some(msg => msg.role === 'system');
      const messagesWithContext = systemMessageExists ? messages : [
        {
          role: 'system',
          content: optimizedPrompt
        },
        ...messages
      ];
      
      // Get AI completion based on selected model
      const completionResult = await this.aiService.getCompletion(
        messagesWithContext, 
        model, 
        temperature, 
        maxTokens
      );
      
      // Cache the response
      this.cacheService.set(cacheKey, completionResult);
      
      return completionResult;
    } catch (error) {
      console.error('Error in AI processing:', error);
      
      // For OpenAI service errors, try falling back to Gemini if available
      if (model === 'openai' && 
          (error.status === 401 || error.status === 500) && 
          this.aiService.isModelAvailable('gemini')) {
        console.log("Attempting fallback to Gemini model");
        return this.processRequest(messages, 'gemini', temperature, maxTokens, promptId);
      }
      
      throw error;
    }
  }
}
