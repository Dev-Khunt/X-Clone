import dotenv from "dotenv";
dotenv.config();
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

async function initializeDatabase() {
  // Create connection without database first
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER1 || "root",
    password: process.env.DB_PASSWORD || "Dev@1234",
    port: Number(process.env.DB_PORT || 3306),
  });

  try {
    const schemaPath = path.join(__dirname, "../schema/index.sql");
    const schema = fs.readFileSync(schemaPath, "utf-8");
    
    // Split the schema into individual statements
    const statements = schema
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    for (const statement of statements) {
      try {
        // Use query for USE statements, queryable for others
        if (statement.toLowerCase().startsWith("use ")) {
          await (connection as any).query(statement);
        } else {
          await connection.query(statement);
        }
        console.log("✓ Executed:", statement.substring(0, 50) + "...");
      } catch (error: any) {
        // Ignore errors for already created databases/tables
        if (!error.message.includes("already exists")) {
          console.log("Statement:", statement);
          throw error;
        }
        console.log("⚠ Skipped (already exists):", statement.substring(0, 50) + "...");
      }
    }

    console.log("✓ Database initialized successfully!");
  } finally {
    await connection.end();
  }
}

initializeDatabase().catch((err) => {
  console.error("Failed to initialize database:", err);
  process.exit(1);
});
