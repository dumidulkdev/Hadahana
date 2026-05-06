export default () => ({
  port: process.env.PORT || 3000,
  database_uri: process.env.MONGO_DATABASE_URI,
  redis_host: process.env.REDIS_HOST,
  redis_port: parseInt(process.env.REDIS_PORT || '6379', 10),
  redis_password: process.env.REDIS_PASSWORD,
  engine_base_url: (process.env.ENGINE_BASE_URL && !process.env.ENGINE_BASE_URL.startsWith('http')) 
    ? `https://${process.env.ENGINE_BASE_URL}` 
    : process.env.ENGINE_BASE_URL,
  engine_base_path: process.env.ENGINE_BASE_PATH,
  gen_ai_api_key: process.env.GEN_AI_API_KEY,
  gen_ai_model: process.env.GEN_AI_MODEL || 'gemini-1.5-flash',
});
