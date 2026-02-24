export default () => ({
  port: process.env.PORT || 3000,
  database_uri: process.env.MONGO_DATABASE_URI,
  jwt_access_token: process.env.JWT_ACCESS_SECRET,
});
