// Test deployment script for Neon PostgreSQL
console.log("🚀 NEON POSTGRESQL DEPLOYMENT CHECK");
console.log("=================================");

// Development Branch Connection String
const DEV_DB_URL = "postgresql://neondb_owner:npg_u97gDpBrnoyf@ep-delicate-cake-a1doy3cz-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

// Production Branch Connection String
const PROD_DB_URL = "postgresql://neondb_owner:npg_u97gDpBrnoyf@ep-sweet-thunder-a1m11w15-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

console.log("\n✅ Development Branch:");
console.log("Host:", "ep-delicate-cake-a1doy3cz-pooler.ap-southeast-1.aws.neon.tech");
console.log("Database:", "neondb");
console.log("Full URL:", DEV_DB_URL);

console.log("\n✅ Production Branch:");
console.log("Host:", "ep-sweet-thunder-a1m11w15-pooler.ap-southeast-1.aws.neon.tech");
console.log("Database:", "neondb");
console.log("Full URL:", PROD_DB_URL);

console.log("\n📝 NEXT STEPS:");
console.log(`1. Run: DATABASE_URL="${DEV_DB_URL}" npx prisma db push`);
console.log(`2. Run: DATABASE_URL="${PROD_DB_URL}" npx prisma db push`);
console.log("3. Setup Vercel Environment Variables");
console.log("4. Deploy to Vercel");

console.log("\n🎉 Ready for deployment!");
