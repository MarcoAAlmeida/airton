export default defineNuxtRouteMiddleware(async () => {
  const { fetch, loggedIn, ready } = useUserSession()

  if (!ready.value) {
    await fetch()
  }

  if (!loggedIn.value) {
    return navigateTo('/')
  }
})
