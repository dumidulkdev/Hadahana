export default () => ({
  port: process.env.PORT || 3000,
  database_uri: process.env.MONGO_DATABASE_URI,
  jwt_access_token: process.env.JWT_ACCESS_SECRET,
  jwt_refresh_token: process.env.JWT_REFRESH_TOKEN,
  engine_base_url: process.env.ENGINE_BASE_URL,
  engine_base_path: process.env.ENGINE_BASE_PATH,
  gen_ai_api_key: process.env.GEN_AI_API_KEY,
});
