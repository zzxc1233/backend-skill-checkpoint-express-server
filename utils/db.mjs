// Create PostgreSQL Connection Pool here !
import * as pg from "pg";
const { Pool } = pg.default;

const connectionPool = new Pool({
  connectionString:
    "postgresql://postgres:newpassword@localhost:5432/checkpoint-backend",
});

export default connectionPool;
