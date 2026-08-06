import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Layout } from './Layout'

describe('Layout', () => {
  it('keeps mobile content clear of the fixed bottom navigation', () => {
    const html = renderToStaticMarkup(<Layout><div>Konten</div></Layout>)

    expect(html).toContain('pb-40')
  })
})
