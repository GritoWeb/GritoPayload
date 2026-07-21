import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

// Rename the "challenge" block to a generic "intro" block, add a layout toggle
// and a localized eyebrow, and convert the plain-text body into a Lexical
// richText value. The body conversion splits paragraphs on blank lines so the
// existing multi-paragraph copy survives the migration.

type RowValue = string | number | null

// The D1 driver returns query output under `.results` (array of column-keyed
// objects); other SQLite drivers use `.rows`. Support both.
function extractRows(result: unknown): unknown[] {
  if (Array.isArray(result)) return result
  if (result && typeof result === 'object') {
    const record = result as Record<string, unknown>
    if (Array.isArray(record.results)) return record.results
    if (Array.isArray(record.rows)) return record.rows
  }
  return []
}

function readCell(row: unknown, index: number, key: string): RowValue {
  if (Array.isArray(row)) return (row[index] ?? null) as RowValue
  if (row && typeof row === 'object') {
    const record = row as Record<string, RowValue>
    return record[key] ?? record[String(index)] ?? null
  }
  return null
}

// Build a minimal Lexical editor state from plain text (blank line = new paragraph).
function textToLexical(text: string): string {
  const paragraphs = text
    .split(/\r?\n\r?\n+/)
    .map((p) => p.trim())
    .filter(Boolean)

  const children = (paragraphs.length ? paragraphs : ['']).map((paragraph) => ({
    type: 'paragraph',
    version: 1,
    direction: 'ltr',
    format: '',
    indent: 0,
    textFormat: 0,
    textStyle: '',
    children: [
      {
        type: 'text',
        version: 1,
        detail: 0,
        format: 0,
        mode: 'normal',
        style: '',
        text: paragraph,
      },
    ],
  }))

  return JSON.stringify({
    root: {
      type: 'root',
      version: 1,
      direction: 'ltr',
      format: '',
      indent: 0,
      children,
    },
  })
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // 1. New columns — non-localized on the main / version tables.
  await db.run(sql`ALTER TABLE \`portfolios\` ADD \`intro_layout\` text DEFAULT 'two';`)
  await db.run(sql`ALTER TABLE \`portfolios\` ADD \`intro_title\` text;`)
  await db.run(sql`ALTER TABLE \`portfolios\` ADD \`intro_body\` text;`)
  await db.run(sql`ALTER TABLE \`_portfolios_v\` ADD \`version_intro_layout\` text DEFAULT 'two';`)
  await db.run(sql`ALTER TABLE \`_portfolios_v\` ADD \`version_intro_title\` text;`)
  await db.run(sql`ALTER TABLE \`_portfolios_v\` ADD \`version_intro_body\` text;`)

  // 2. New localized eyebrow — lives on the locales tables.
  await db.run(sql`ALTER TABLE \`portfolios_locales\` ADD \`intro_eyebrow\` text;`)
  await db.run(sql`ALTER TABLE \`_portfolios_v_locales\` ADD \`version_intro_eyebrow\` text;`)

  // 3. Carry the existing content over: title as-is, body text -> Lexical JSON.
  const rows = extractRows(
    await db.run(sql`SELECT \`id\`, \`challenge_title\`, \`challenge_body\` FROM \`portfolios\`;`),
  )
  for (const row of rows) {
    const id = readCell(row, 0, 'id')
    const title = readCell(row, 1, 'challenge_title')
    const body = readCell(row, 2, 'challenge_body')
    const bodyJson = typeof body === 'string' && body.length ? textToLexical(body) : null
    await db.run(
      sql`UPDATE \`portfolios\` SET \`intro_title\` = ${title}, \`intro_body\` = ${bodyJson} WHERE \`id\` = ${id};`,
    )
  }

  const versionRows = extractRows(
    await db.run(
      sql`SELECT \`id\`, \`version_challenge_title\`, \`version_challenge_body\` FROM \`_portfolios_v\`;`,
    ),
  )
  for (const row of versionRows) {
    const id = readCell(row, 0, 'id')
    const title = readCell(row, 1, 'version_challenge_title')
    const body = readCell(row, 2, 'version_challenge_body')
    const bodyJson = typeof body === 'string' && body.length ? textToLexical(body) : null
    await db.run(
      sql`UPDATE \`_portfolios_v\` SET \`version_intro_title\` = ${title}, \`version_intro_body\` = ${bodyJson} WHERE \`id\` = ${id};`,
    )
  }

  // 4. Drop the old challenge columns.
  await db.run(sql`ALTER TABLE \`portfolios\` DROP COLUMN \`challenge_title\`;`)
  await db.run(sql`ALTER TABLE \`portfolios\` DROP COLUMN \`challenge_body\`;`)
  await db.run(sql`ALTER TABLE \`_portfolios_v\` DROP COLUMN \`version_challenge_title\`;`)
  await db.run(sql`ALTER TABLE \`_portfolios_v\` DROP COLUMN \`version_challenge_body\`;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Restore the challenge columns and copy the intro title back (body reverts to
  // plain text, joining Lexical paragraphs with blank lines on a best-effort basis).
  await db.run(sql`ALTER TABLE \`portfolios\` ADD \`challenge_title\` text;`)
  await db.run(sql`ALTER TABLE \`portfolios\` ADD \`challenge_body\` text;`)
  await db.run(sql`ALTER TABLE \`_portfolios_v\` ADD \`version_challenge_title\` text;`)
  await db.run(sql`ALTER TABLE \`_portfolios_v\` ADD \`version_challenge_body\` text;`)

  await db.run(sql`UPDATE \`portfolios\` SET \`challenge_title\` = \`intro_title\`;`)
  await db.run(sql`UPDATE \`_portfolios_v\` SET \`version_challenge_title\` = \`version_intro_title\`;`)

  await db.run(sql`ALTER TABLE \`portfolios\` DROP COLUMN \`intro_layout\`;`)
  await db.run(sql`ALTER TABLE \`portfolios\` DROP COLUMN \`intro_title\`;`)
  await db.run(sql`ALTER TABLE \`portfolios\` DROP COLUMN \`intro_body\`;`)
  await db.run(sql`ALTER TABLE \`_portfolios_v\` DROP COLUMN \`version_intro_layout\`;`)
  await db.run(sql`ALTER TABLE \`_portfolios_v\` DROP COLUMN \`version_intro_title\`;`)
  await db.run(sql`ALTER TABLE \`_portfolios_v\` DROP COLUMN \`version_intro_body\`;`)
  await db.run(sql`ALTER TABLE \`portfolios_locales\` DROP COLUMN \`intro_eyebrow\`;`)
  await db.run(sql`ALTER TABLE \`_portfolios_v_locales\` DROP COLUMN \`version_intro_eyebrow\`;`)
}
