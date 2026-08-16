type Role = 'admin' | 'client'

interface Credentials {
  email: string
  password: string
}

function passwordsMatch(candidate: string, expected: string) {
  const candidateBytes = new TextEncoder().encode(candidate)
  const expectedBytes = new TextEncoder().encode(expected)
  const longestLength = Math.max(candidateBytes.length, expectedBytes.length)
  let difference = candidateBytes.length ^ expectedBytes.length

  for (let index = 0; index < longestLength; index++) {
    difference |= (candidateBytes[index] || 0) ^ (expectedBytes[index] || 0)
  }

  return difference === 0
}

export default defineEventHandler(async (event) => {
  const body = await readBody<Credentials>(event)
  const config = useRuntimeConfig(event)

  if (!body?.email || !body.password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email and password are required.'
    })
  }

  const accounts: Array<Credentials & { role: Role }> = [
    {
      email: config.airtonAdminEmail,
      password: config.airtonAdminPassword,
      role: 'admin'
    },
    {
      email: config.airtonClientEmail,
      password: config.airtonClientPassword,
      role: 'client'
    }
  ]

  const account = accounts.find(candidate =>
    candidate.email === body.email && passwordsMatch(body.password, candidate.password)
  )

  if (!account) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid email or password.'
    })
  }

  await setUserSession(event, {
    user: {
      email: account.email,
      role: account.role
    }
  })

  return { role: account.role }
})
