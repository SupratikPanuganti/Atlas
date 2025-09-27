import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Client } = pkg;

async function testConnection() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  
  try {
    console.log("Testing Supabase connection...");
    await client.connect();
    console.log("✅ Connected to Supabase successfully!");
    
    // Test basic query
    const result = await client.query("SELECT version()");
    console.log("✅ Database version:", result.rows[0].version);
    
    // List tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema='public'
    `);
    console.log("✅ Available tables:", tables.rows.map(r => r.table_name));
    
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
  } finally {
    await client.end();
  }
}

testConnection();


