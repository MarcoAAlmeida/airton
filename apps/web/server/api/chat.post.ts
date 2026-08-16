export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const body = await readBody(event)
  const config = useRuntimeConfig(event)

  if (!config.airtonApiToken) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Chat API access is not configured.'
    })
  }

  const response = await fetch(`${config.airtonApiUrl}/api/chat`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-airton-api-token': config.airtonApiToken
    },
    body: JSON.stringify(body)
  })

  if (!response.ok || !response.body) {
    throw createError({
      statusCode: response.status || 502,
      statusMessage: 'The chat service is unavailable.'
    })
  }

  return new Response(response.body, {
    headers: {
      'cache-control': 'no-store',
      'content-type': response.headers.get('content-type') || 'text/event-stream',
      'x-content-type-options': 'nosniff'
    }
  })
})
