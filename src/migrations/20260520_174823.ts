import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pages_blocks_home_section_logo_cloud_locales\` DROP COLUMN \`title\`;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_home_section_logo_cloud_locales\` DROP COLUMN \`title\`;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pages_blocks_home_section_logo_cloud_locales\` ADD \`title\` text DEFAULT 'Empresas que *confiam* na gente';`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_home_section_logo_cloud_locales\` ADD \`title\` text DEFAULT 'Empresas que *confiam* na gente';`)
}
