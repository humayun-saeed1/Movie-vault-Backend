import pg from 'pg';
const { Client } = pg;
const client = new Client({
  connectionString: 'postgresql://postgres:humayun123@localhost:5432/movie_vault_crud?schema=public'
});

async function main() {
  await client.connect();
  const users = await client.query('SELECT * FROM "users"');
  console.log("Users:", users.rows.map(u => `${u.email} - ${u.role}`));

}
main().finally(() => client.end());
