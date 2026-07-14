import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`pages_blocks_latest_posts_locales\` (
  	\`eyebrow\` text DEFAULT 'Blog',
  	\`title\` text DEFAULT '*Últimos posts* do blog',
  	\`button_label\` text DEFAULT 'Ver todos os posts',
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_latest_posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_latest_posts_locales_locale_parent_id_unique\` ON \`pages_blocks_latest_posts_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_latest_portfolios_locales\` (
  	\`eyebrow\` text DEFAULT 'Portfólio',
  	\`title\` text DEFAULT '*Últimos projetos* que entregamos',
  	\`button_label\` text DEFAULT 'Ver portfólio completo',
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_latest_portfolios\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_latest_portfolios_locales_locale_parent_id_uniq\` ON \`pages_blocks_latest_portfolios_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_latest_posts_locales\` (
  	\`eyebrow\` text DEFAULT 'Blog',
  	\`title\` text DEFAULT '*Últimos posts* do blog',
  	\`button_label\` text DEFAULT 'Ver todos os posts',
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_latest_posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_latest_posts_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_latest_posts_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_latest_portfolios_locales\` (
  	\`eyebrow\` text DEFAULT 'Portfólio',
  	\`title\` text DEFAULT '*Últimos projetos* que entregamos',
  	\`button_label\` text DEFAULT 'Ver portfólio completo',
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_latest_portfolios\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_latest_portfolios_locales_locale_parent_id_u\` ON \`_pages_v_blocks_latest_portfolios_locales\` (\`_locale\`,\`_parent_id\`);`)
  // Carrega o conteúdo já existente (que era global) para o locale padrão antes de dropar as colunas.
  await db.run(sql`INSERT INTO \`pages_blocks_latest_posts_locales\` (\`eyebrow\`, \`title\`, \`button_label\`, \`_locale\`, \`_parent_id\`) SELECT \`eyebrow\`, \`title\`, \`button_label\`, 'pt', \`id\` FROM \`pages_blocks_latest_posts\`;`)
  await db.run(sql`INSERT INTO \`pages_blocks_latest_portfolios_locales\` (\`eyebrow\`, \`title\`, \`button_label\`, \`_locale\`, \`_parent_id\`) SELECT \`eyebrow\`, \`title\`, \`button_label\`, 'pt', \`id\` FROM \`pages_blocks_latest_portfolios\`;`)
  await db.run(sql`INSERT INTO \`_pages_v_blocks_latest_posts_locales\` (\`eyebrow\`, \`title\`, \`button_label\`, \`_locale\`, \`_parent_id\`) SELECT \`eyebrow\`, \`title\`, \`button_label\`, 'pt', \`id\` FROM \`_pages_v_blocks_latest_posts\`;`)
  await db.run(sql`INSERT INTO \`_pages_v_blocks_latest_portfolios_locales\` (\`eyebrow\`, \`title\`, \`button_label\`, \`_locale\`, \`_parent_id\`) SELECT \`eyebrow\`, \`title\`, \`button_label\`, 'pt', \`id\` FROM \`_pages_v_blocks_latest_portfolios\`;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_latest_posts\` DROP COLUMN \`eyebrow\`;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_latest_posts\` DROP COLUMN \`title\`;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_latest_posts\` DROP COLUMN \`button_label\`;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_latest_portfolios\` DROP COLUMN \`eyebrow\`;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_latest_portfolios\` DROP COLUMN \`title\`;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_latest_portfolios\` DROP COLUMN \`button_label\`;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_latest_posts\` DROP COLUMN \`eyebrow\`;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_latest_posts\` DROP COLUMN \`title\`;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_latest_posts\` DROP COLUMN \`button_label\`;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_latest_portfolios\` DROP COLUMN \`eyebrow\`;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_latest_portfolios\` DROP COLUMN \`title\`;`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_latest_portfolios\` DROP COLUMN \`button_label\`;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pages_blocks_latest_posts\` ADD \`eyebrow\` text DEFAULT 'Blog';`)
  await db.run(sql`ALTER TABLE \`pages_blocks_latest_posts\` ADD \`title\` text DEFAULT '*Últimos posts* do blog';`)
  await db.run(sql`ALTER TABLE \`pages_blocks_latest_posts\` ADD \`button_label\` text DEFAULT 'Ver todos os posts';`)
  await db.run(sql`ALTER TABLE \`pages_blocks_latest_portfolios\` ADD \`eyebrow\` text DEFAULT 'Portfólio';`)
  await db.run(sql`ALTER TABLE \`pages_blocks_latest_portfolios\` ADD \`title\` text DEFAULT '*Últimos projetos* que entregamos';`)
  await db.run(sql`ALTER TABLE \`pages_blocks_latest_portfolios\` ADD \`button_label\` text DEFAULT 'Ver portfólio completo';`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_latest_posts\` ADD \`eyebrow\` text DEFAULT 'Blog';`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_latest_posts\` ADD \`title\` text DEFAULT '*Últimos posts* do blog';`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_latest_posts\` ADD \`button_label\` text DEFAULT 'Ver todos os posts';`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_latest_portfolios\` ADD \`eyebrow\` text DEFAULT 'Portfólio';`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_latest_portfolios\` ADD \`title\` text DEFAULT '*Últimos projetos* que entregamos';`)
  await db.run(sql`ALTER TABLE \`_pages_v_blocks_latest_portfolios\` ADD \`button_label\` text DEFAULT 'Ver portfólio completo';`)

  // Devolve o conteúdo do locale padrão às colunas globais antes de descartar as tabelas de locale.
  await db.run(sql`UPDATE \`pages_blocks_latest_posts\` SET \`eyebrow\` = (SELECT \`eyebrow\` FROM \`pages_blocks_latest_posts_locales\` l WHERE l.\`_parent_id\` = \`pages_blocks_latest_posts\`.\`id\` AND l.\`_locale\` = 'pt'), \`title\` = (SELECT \`title\` FROM \`pages_blocks_latest_posts_locales\` l WHERE l.\`_parent_id\` = \`pages_blocks_latest_posts\`.\`id\` AND l.\`_locale\` = 'pt'), \`button_label\` = (SELECT \`button_label\` FROM \`pages_blocks_latest_posts_locales\` l WHERE l.\`_parent_id\` = \`pages_blocks_latest_posts\`.\`id\` AND l.\`_locale\` = 'pt');`)
  await db.run(sql`UPDATE \`pages_blocks_latest_portfolios\` SET \`eyebrow\` = (SELECT \`eyebrow\` FROM \`pages_blocks_latest_portfolios_locales\` l WHERE l.\`_parent_id\` = \`pages_blocks_latest_portfolios\`.\`id\` AND l.\`_locale\` = 'pt'), \`title\` = (SELECT \`title\` FROM \`pages_blocks_latest_portfolios_locales\` l WHERE l.\`_parent_id\` = \`pages_blocks_latest_portfolios\`.\`id\` AND l.\`_locale\` = 'pt'), \`button_label\` = (SELECT \`button_label\` FROM \`pages_blocks_latest_portfolios_locales\` l WHERE l.\`_parent_id\` = \`pages_blocks_latest_portfolios\`.\`id\` AND l.\`_locale\` = 'pt');`)
  await db.run(sql`UPDATE \`_pages_v_blocks_latest_posts\` SET \`eyebrow\` = (SELECT \`eyebrow\` FROM \`_pages_v_blocks_latest_posts_locales\` l WHERE l.\`_parent_id\` = \`_pages_v_blocks_latest_posts\`.\`id\` AND l.\`_locale\` = 'pt'), \`title\` = (SELECT \`title\` FROM \`_pages_v_blocks_latest_posts_locales\` l WHERE l.\`_parent_id\` = \`_pages_v_blocks_latest_posts\`.\`id\` AND l.\`_locale\` = 'pt'), \`button_label\` = (SELECT \`button_label\` FROM \`_pages_v_blocks_latest_posts_locales\` l WHERE l.\`_parent_id\` = \`_pages_v_blocks_latest_posts\`.\`id\` AND l.\`_locale\` = 'pt');`)
  await db.run(sql`UPDATE \`_pages_v_blocks_latest_portfolios\` SET \`eyebrow\` = (SELECT \`eyebrow\` FROM \`_pages_v_blocks_latest_portfolios_locales\` l WHERE l.\`_parent_id\` = \`_pages_v_blocks_latest_portfolios\`.\`id\` AND l.\`_locale\` = 'pt'), \`title\` = (SELECT \`title\` FROM \`_pages_v_blocks_latest_portfolios_locales\` l WHERE l.\`_parent_id\` = \`_pages_v_blocks_latest_portfolios\`.\`id\` AND l.\`_locale\` = 'pt'), \`button_label\` = (SELECT \`button_label\` FROM \`_pages_v_blocks_latest_portfolios_locales\` l WHERE l.\`_parent_id\` = \`_pages_v_blocks_latest_portfolios\`.\`id\` AND l.\`_locale\` = 'pt');`)

  await db.run(sql`DROP TABLE \`pages_blocks_latest_posts_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_latest_portfolios_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_latest_posts_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_latest_portfolios_locales\`;`)
}
