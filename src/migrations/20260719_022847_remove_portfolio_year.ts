import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`portfolios\` DROP COLUMN \`year\`;`)
  await db.run(sql`ALTER TABLE \`_portfolios_v\` DROP COLUMN \`version_year\`;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`portfolios\` ADD \`year\` text;`)
  await db.run(sql`ALTER TABLE \`_portfolios_v\` ADD \`version_year\` text;`)
}
