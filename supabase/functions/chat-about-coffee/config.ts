
declare const Deno: any;

export class Config {
  private static instance: Config;
  private readonly envVars: Map<string, string> = new Map();

  private constructor() {
    // Initialize environment variables
    ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'GEMINI_API_KEY'].forEach(key => {
      const value = Deno.env.get(key);
      if (value) {
        this.envVars.set(key, value);
      }
    });
  }

  static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  get(key: string): string {
    const value = this.envVars.get(key);
    if (!value) {
      throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
  }
}

export const config = Config.getInstance();
