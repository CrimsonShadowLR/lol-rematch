export const config = { runtime: 'edge' }

const BASE_HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  Referer: 'https://porofessor.gg/',
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const targetPath = url.searchParams.get('path') ?? ''
  const targetUrl = `https://porofessor.gg/${targetPath}`

  const res = await fetch(targetUrl, {
    method: req.method,
    headers: BASE_HEADERS,
  })

  const body = await res.arrayBuffer()
  return new Response(body, {
    status: res.status,
    headers: {
      'Content-Type': res.headers.get('Content-Type') ?? 'text/html; charset=utf-8',
    },
  })
}
