import type { PageContent } from './types'

import { agencias } from './agencias'
import { blog } from './blog'
import { contato } from './contato'
import { home } from './home'
import { portfolio } from './portfolio'
import { servicos } from './servicos'

/** Ordem em que o seed roda. A página "sobre" tem conteúdo escrito, mas não existe no CMS. */
export const PAGES: PageContent[] = [home, servicos, agencias, portfolio, blog, contato]
