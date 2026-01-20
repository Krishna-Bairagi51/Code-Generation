interface Env {
  // Core Settings
  RUNNING_IN_DOCKER: string;
  DEFAULT_NUM_CTX: string;
  ENABLE_LANGGRAPH_AGENT: string;

  // Active Providers
  GOOGLE_GENERATIVE_AI_API_KEY: string;
  AWS_BEDROCK_CONFIG: string;

  // Other Providers (kept for compatibility)
  ANTHROPIC_API_KEY: string;
  OPENAI_API_KEY: string;
  GROQ_API_KEY: string;
  HuggingFace_API_KEY: string;
  OPEN_ROUTER_API_KEY: string;
  OLLAMA_API_BASE_URL: string;
  OPENAI_LIKE_API_KEY: string;
  OPENAI_LIKE_API_BASE_URL: string;
  OPENAI_LIKE_API_MODELS: string;
  TOGETHER_API_KEY: string;
  TOGETHER_API_BASE_URL: string;
  DEEPSEEK_API_KEY: string;
  LMSTUDIO_API_BASE_URL: string;
  MISTRAL_API_KEY: string;
  XAI_API_KEY: string;
  PERPLEXITY_API_KEY: string;
  COHERE_API_KEY: string;
  GITHUB_TOKEN: string;
  VITE_GITHUB_ACCESS_TOKEN: string;
  HYPERBOLIC_API_KEY: string;
  MOONSHOT_API_KEY: string;
}
