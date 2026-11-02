import fs from "node:fs";
import path from "node:path";
import { pool } from "./pool";

async function main() {
  await pool.query(`
    create table if not exists schema_migrations (
      filename text primary key,
      applied_at timestamptz not null default now()
    )
  `);

  const dir = path.join(__dirname, "../../migrations");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
  console.log(`found ${files.length} migration file(s)`);

  for (const file of files) {
    const done = await pool.query("select 1 from schema_migrations where filename = $1", [file]);
    if (done.rowCount) continue;

    const sql = fs.readFileSync(path.join(dir, file), "utf8");
    const client = await pool.connect();
    try {
      await client.query("begin");
      await client.query(sql);
      await client.query("insert into schema_migrations (filename) values ($1)", [file]);
      await client.query("commit");
      console.log("applied", file);
    } catch (err) {
      await client.query("rollback");
      throw err;
    } finally {
      client.release();
    }
  }
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});