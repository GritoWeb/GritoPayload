import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`portfolios_team\`;`)
  await db.run(sql`DROP TABLE \`_portfolios_v_version_team\`;`)
  await db.run(sql`ALTER TABLE \`portfolios\` DROP COLUMN \`site_url\`;`)
  await db.run(sql`ALTER TABLE \`portfolios\` DROP COLUMN \`next_project_href\`;`)
  await db.run(sql`ALTER TABLE \`_portfolios_v\` DROP COLUMN \`version_site_url\`;`)
  await db.run(sql`ALTER TABLE \`_portfolios_v\` DROP COLUMN \`version_next_project_href\`;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`portfolios_team\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`role\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`portfolios\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`portfolios_team_order_idx\` ON \`portfolios_team\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`portfolios_team_parent_id_idx\` ON \`portfolios_team\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_portfolios_v_version_team\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`role\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_portfolios_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_portfolios_v_version_team_order_idx\` ON \`_portfolios_v_version_team\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_portfolios_v_version_team_parent_id_idx\` ON \`_portfolios_v_version_team\` (\`_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`portfolios\` ADD \`site_url\` text;`)
  await db.run(sql`ALTER TABLE \`portfolios\` ADD \`next_project_href\` text;`)
  await db.run(sql`ALTER TABLE \`_portfolios_v\` ADD \`version_site_url\` text;`)
  await db.run(sql`ALTER TABLE \`_portfolios_v\` ADD \`version_next_project_href\` text;`)
}
