
export default () => ({
	port: process.env.PORT || 3000,
	database_uri:process.env.MONGO_DATABASE_URI
});
