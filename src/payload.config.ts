import fs from 'fs'
import path from 'path'
import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { CloudflareContext, getCloudflareContext } from '@opennextjs/cloudflare'
import { GetPlatformProxyOptions } from 'wrangler'
import { r2Storage } from '@payloadcms/storage-r2'
import { seoPlugin } from '@payloadcms/plugin-seo'
import type {
  GenerateTitle,
  GenerateDescription,
  GenerateURL,
} from '@payloadcms/plugin-seo/types'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Portfolios } from './collections/Portfolios'
import { PortfolioTags } from './collections/PortfolioTags'
import { Posts } from './collections/Posts'
import { Tags } from './collections/Tags'
import { HeaderGlobal } from './Header/config'
import { FooterGlobal } from './Footer/config'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const realpath = (value: string) => (fs.existsSync(value) ? fs.realpathSync(value) : undefined)

// `realpath` returns undefined for argv entries that are not existing files, which
// happens under `next start` — guard before calling into it or config evaluation
// throws and every Payload-backed route 500s.
const isCLI = process.argv.some((value) =>
  realpath(value)?.endsWith(path.join('payload', 'bin.js')),
)
const isProduction = process.env.NODE_ENV === 'production'
const isBuild = process.env.NEXT_PHASE === 'phase-production-build'

const createLog =
  (level: string, fn: typeof console.log) => (objOrMsg: object | string, msg?: string) => {
    if (typeof objOrMsg === 'string') {
      fn(JSON.stringify({ level, msg: objOrMsg }))
    } else {
      fn(JSON.stringify({ level, ...objOrMsg, msg: msg ?? (objOrMsg as { msg?: string }).msg }))
    }
  }

const cloudflareLogger = {
  level: process.env.PAYLOAD_LOG_LEVEL || 'info',
  trace: createLog('trace', console.debug),
  debug: createLog('debug', console.debug),
  info: createLog('info', console.log),
  warn: createLog('warn', console.warn),
  error: createLog('error', console.error),
  fatal: createLog('fatal', console.error),
  silent: () => {},
} as any // Use PayloadLogger type when it's exported

const cloudflare =
  isCLI || !isProduction || isBuild
    ? await getCloudflareContextFromWrangler()
    : await getCloudflareContext({ async: true })

// SEO plugin — defaults used by the "auto-generate" buttons in the admin.
type SeoDoc = { title?: string; excerpt?: string; summary?: string; slug?: string }

const generateTitle: GenerateTitle = ({ doc }) => {
  const { title } = (doc ?? {}) as SeoDoc
  return title ? `${title} | Grito` : 'Grito'
}

const generateDescription: GenerateDescription = ({ doc }) => {
  const { excerpt, summary } = (doc ?? {}) as SeoDoc
  return excerpt || summary || ''
}

const generateURL: GenerateURL = ({ doc }) => {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? ''
  const { slug } = (doc ?? {}) as SeoDoc
  return slug ? `${base}/${slug}` : base
}

export default buildConfig({
  admin: {
    user: Users.slug,
    components: {
      providers: ['@/components/admin/BlockScrollProvider#default'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  localization: {
    locales: [
      { label: 'Português', code: 'pt' },
      { label: 'English', code: 'en' },
    ],
    defaultLocale: 'pt',
    fallback: true,
  },
  collections: [Users, Media, Pages, Portfolios, PortfolioTags, Posts, Tags],
  globals: [HeaderGlobal, FooterGlobal],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteD1Adapter({
    binding: cloudflare.env.D1,
    push: false,
  }),
  logger: isProduction ? cloudflareLogger : undefined,
  plugins: [
    r2Storage({
      bucket: cloudflare.env.R2,
      collections: { media: true },
    }),
    seoPlugin({
      collections: ['pages', 'posts', 'portfolios'],
      uploadsCollection: 'media',
      tabbedUI: true,
      generateTitle,
      generateDescription,
      generateURL,
      // Plugin defaults title/description/image to localized. Keep title and
      // description per-locale (pt/en), but make the OG image a single shared value.
      fields: ({ defaultFields }) =>
        defaultFields.map((field) =>
          'name' in field && field.name === 'image'
            ? { ...field, localized: false }
            : field,
        ),
    }),
  ],
})

// Adapted from https://github.com/opennextjs/opennextjs-cloudflare/blob/d00b3a13e42e65aad76fba41774815726422cc39/packages/cloudflare/src/api/cloudflare-context.ts#L328C36-L328C46
function getCloudflareContextFromWrangler(): Promise<CloudflareContext> {
  return import(/* webpackIgnore: true */ `${'__wrangler'.replaceAll('_', '')}`).then(
    ({ getPlatformProxy }) =>
      getPlatformProxy({
        environment: process.env.CLOUDFLARE_ENV,
        remoteBindings: isProduction && !isBuild,
      } satisfies GetPlatformProxyOptions),
  )
}
