export const config = { runtime: 'edge' }

const FORWARD_HEADERS = ['accept', 'content-type', 'next-action', 'next-router-state-tree', 'rsc']

const BASE_HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  Referer: 'https://op.gg/',
  Origin: 'https://op.gg',
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const targetPath = url.pathname.replace(/^\/api\/proxy\/opgg/, '')
  const targetUrl = `https://op.gg${targetPath}${url.search}`

  const headers: Record<string, string> = { ...BASE_HEADERS }
  for (const h of FORWARD_HEADERS) {
    const v = req.headers.get(h)
    if (v) headers[h] = v
  }

  const hasBody = req.method !== 'GET' && req.method !== 'HEAD'
  const body = hasBody ? await req.text() : undefined

  const res = await fetch(targetUrl, {
    method: req.method,
    headers,
    body,
  })

  const resBody = await res.arrayBuffer()
  return new Response(resBody, {
    status: res.status,
    headers: {
      'Content-Type': res.headers.get('Content-Type') ?? 'text/plain; charset=utf-8',
    },
  })
}
