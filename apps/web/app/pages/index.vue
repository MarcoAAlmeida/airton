<script setup lang="ts">
import * as z from 'zod'
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'

const { clear, fetch: fetchUserSession, loggedIn, ready, user } = useUserSession()
const isSignInOpen = ref(false)
const isSigningIn = ref(false)
const loginError = ref('')

const fields: AuthFormField[] = [
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'you@example.com',
    required: true
  },
  {
    name: 'password',
    type: 'password',
    label: 'Password',
    placeholder: 'Enter your password',
    required: true
  }
]

const schema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.')
})

type LoginSchema = z.output<typeof schema>

const role = computed(() => user.value?.role)

function openSignIn() {
  loginError.value = ''
  isSignInOpen.value = true
}

async function signIn(event: FormSubmitEvent<LoginSchema>) {
  isSigningIn.value = true
  loginError.value = ''

  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: event.data
    })
    await fetchUserSession()
    isSignInOpen.value = false
  } catch {
    loginError.value = 'Incorrect email or password.'
  } finally {
    isSigningIn.value = false
  }
}

async function signOut() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
}
</script>

<template>
  <main class="min-h-screen bg-default">
    <UContainer class="flex min-h-screen max-w-5xl flex-col py-4 sm:py-8">
      <header class="flex items-center justify-between">
        <NuxtLink
          to="/"
          class="text-lg font-semibold text-highlighted"
        >
          Airton
        </NuxtLink>

        <div class="flex items-center gap-2">
          <UColorModeButton />
          <UButton
            v-if="loggedIn"
            label="Sign out"
            icon="i-lucide-log-out"
            color="neutral"
            variant="outline"
            @click="signOut"
          />
          <UButton
            v-else
            label="Sign in"
            icon="i-lucide-log-in"
            @click="openSignIn"
          />
        </div>
      </header>

      <section
        v-if="!ready"
        class="flex flex-1 items-center justify-center"
      >
        <UIcon
          name="i-lucide-loader-circle"
          class="size-6 animate-spin text-primary"
        />
      </section>

      <section
        v-else-if="!loggedIn"
        class="flex flex-1 items-center justify-center py-16"
      >
        <UPageCard class="w-full max-w-2xl text-center">
          <p
            class="text-sm font-medium text-primary"
          >
            Airton
          </p>
          <h1 class="mt-3 text-3xl font-semibold text-highlighted sm:text-4xl">
            Turn business questions into clearer next steps.
          </h1>
          <p class="mt-4 text-base text-muted">
            Sign in to explore the AI workspace tailored to your role.
          </p>
          <UButton
            class="mt-8"
            label="Sign in to Airton"
            icon="i-lucide-arrow-right"
            trailing
            size="xl"
            @click="openSignIn"
          />
        </UPageCard>
      </section>

      <section
        v-else-if="role === 'admin'"
        class="flex flex-1 flex-col justify-center py-16"
      >
        <p class="text-sm font-medium text-primary">
          Administrator workspace
        </p>
        <h1 class="mt-3 text-3xl font-semibold text-highlighted sm:text-4xl">
          Welcome back, {{ user?.email }}.
        </h1>
        <p class="mt-4 max-w-2xl text-base text-muted">
          Use Airton to explore positioning, prospecting hypotheses, and the future data integrations for your team.
        </p>
        <div class="mt-8 flex flex-wrap gap-3">
          <UButton
            to="/chat"
            label="Open AI workspace"
            icon="i-lucide-message-square"
          />
          <UBadge
            color="primary"
            variant="subtle"
            size="lg"
          >
            Admin profile
          </UBadge>
        </div>
      </section>

      <section
        v-else
        class="flex flex-1 flex-col justify-center py-16"
      >
        <p
          class="text-sm font-medium text-primary"
        >
          Client workspace
        </p>
        <h1 class="mt-3 text-3xl font-semibold text-highlighted sm:text-4xl">
          Make your next prospecting decision with confidence.
        </h1>
        <p class="mt-4 max-w-2xl text-base text-muted">
          Ask Airton for general business guidance, opportunity framing, and outreach ideas.
        </p>
        <div class="mt-8 flex flex-wrap gap-3">
          <UButton
            to="/chat"
            label="Start a conversation"
            icon="i-lucide-message-square"
          />
          <UBadge
            color="neutral"
            variant="subtle"
            size="lg"
          >
            Client profile
          </UBadge>
        </div>
      </section>

      <UModal
        v-model:open="isSignInOpen"
        title="Sign in to Airton"
        description="Use the account assigned to your profile."
      >
        <template #body>
          <UAlert
            v-if="loginError"
            class="mb-4"
            color="error"
            icon="i-lucide-circle-alert"
            title="Sign-in failed"
            :description="loginError"
          />

          <UAuthForm
            :schema="schema"
            :fields="fields"
            :submit="{ label: 'Sign in', loading: isSigningIn, block: true }"
            icon="i-lucide-lock-keyhole"
            @submit="signIn"
          />
        </template>
      </UModal>
    </UContainer>
  </main>
</template>
