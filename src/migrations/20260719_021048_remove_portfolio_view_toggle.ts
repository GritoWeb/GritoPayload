import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pages_blocks_portfolio_listing\` DROP COLUMN \`show_view_toggle\`;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_portfolio_listing\` DROP COLUMN \`show_view_toggle\`;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pages_blocks_portfolio_listing\` ADD \`show_view_toggle\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_portfolio_listing\` ADD \`show_view_toggle\` integer DEFAULT true;`)
}
