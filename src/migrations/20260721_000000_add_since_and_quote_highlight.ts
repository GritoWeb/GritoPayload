import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

// Add the `since` meta field (facts rail) and the `quoteHighlight` pulled
// sentence (client quote). Both are non-localized, so the columns live on the
// main and version tables only — no locales tables involved.

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`portfolios\` ADD \`since\` text;`)
  await db.run(sql`ALTER TABLE \`portfolios\` ADD \`quote_highlight\` text;`)
  await db.run(sql`ALTER TABLE \`_portfolios_v\` ADD \`version_since\` text;`)
  await db.run(sql`ALTER TABLE \`_portfolios_v\` ADD \`version_quote_highlight\` text;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`portfolios\` DROP COLUMN \`since\`;`)
  await db.run(sql`ALTER TABLE \`portfolios\` DROP COLUMN \`quote_highlight\`;`)
  await db.run(sql`ALTER TABLE \`_portfolios_v\` DROP COLUMN \`version_since\`;`)
  await db.run(sql`ALTER TABLE \`_portfolios_v\` DROP COLUMN \`version_quote_highlight\`;`)
}
