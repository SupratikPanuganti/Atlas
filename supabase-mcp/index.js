import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Client } = pkg;

const server = new Server(
  { name: "supabase-mcp", version: "0.1.0" },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.tool("list_tables", "List all tables in the Supabase DB", async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema='public'
    `);
    return { content: [{ type: "text", text: JSON.stringify(res.rows, null, 2) }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error: ${error.message}` }] };
  } finally {
    await client.end();
  }
});

server.tool("run_query", "Run a raw SQL query", async ({ input }) => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    const res = await client.query(input);
    return { content: [{ type: "text", text: JSON.stringify(res.rows, null, 2) }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error: ${error.message}` }] };
  } finally {
    await client.end();
  }
});

server.tool("get_table_schema", "Get schema information for a specific table", async ({ tableName }) => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    const res = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position
    `, [tableName]);
    return { content: [{ type: "text", text: JSON.stringify(res.rows, null, 2) }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error: ${error.message}` }] };
  } finally {
    await client.end();
  }
});

server.tool("get_table_sample", "Get sample data from a specific table", async ({ tableName, limit = 10 }) => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    const res = await client.query(`SELECT * FROM ${tableName} LIMIT $1`, [limit]);
    return { content: [{ type: "text", text: JSON.stringify(res.rows, null, 2) }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error: ${error.message}` }] };
  } finally {
    await client.end();
  }
});

server.tool("get_betting_stats", "Get aggregated betting statistics from the database", async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    
    // Try to get betting stats - this will depend on your actual table structure
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema='public'
    `);
    
    const tableNames = tables.rows.map(row => row.table_name);
    
    let result = { available_tables: tableNames, betting_data: null };
    
    // Look for betting-related tables
    const bettingTables = tableNames.filter(name => 
      name.toLowerCase().includes('bet') || 
      name.toLowerCase().includes('prop') || 
      name.toLowerCase().includes('odds') ||
      name.toLowerCase().includes('user')
    );
    
    if (bettingTables.length > 0) {
      result.betting_related_tables = bettingTables;
      
      // Try to get sample data from the first betting table
      const sampleTable = bettingTables[0];
      const sampleData = await client.query(`SELECT * FROM ${sampleTable} LIMIT 5`);
      result.sample_data = { table: sampleTable, data: sampleData.rows };
    }
    
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error: ${error.message}` }] };
  } finally {
    await client.end();
  }
});

server.connect(new StdioServerTransport());


