import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pages_blocks_pull_quote_locales\` ADD \`body\` text;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_pull_quote_locales\` ADD \`body\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pages_blocks_pull_quote_locales\` DROP COLUMN \`body\`;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_pull_quote_locales\` DROP COLUMN \`body\`;`)
}
