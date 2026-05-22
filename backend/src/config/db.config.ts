import dotenv from "dotenv";
dotenv.config();
import mysql from "mysql2/promise";

const requiredEnv = ["DB_HOST", "DB_USER1", "DB_PASSWORD", "DB_NAME", "DB_PORT"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  console.warn(`Missing database environment variables: ${missingEnv.join(", ")}`);
}

const db: mysql.Pool = mysql.createPool({
  host: process.env.DB_HOST_PROD,
  user: process.env.DB_USER1_PROD,
  password: process.env.DB_PASSWORD_PROD,
  database: process.env.DB_NAME_PROD,
  port: Number(process.env.DB_PORT_PROD),
  timezone:"Z",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const checkDBConnnection = async () => {
  try {
    const connection = await db.getConnection();
    console.log("Database Connected Successfully");
  } catch (err) {
    console.log("Connection Failed: ", err);
  }
};

checkDBConnnection();

export default db;
