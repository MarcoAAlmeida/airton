declare module '#auth-utils' {
  interface User {
    email: string
    role: 'admin' | 'client'
  }
}

export {}
