<script setup lang="ts">
definePageMeta({
  middleware: 'authenticated'
})

type ChatRole = 'assistant' | 'user'

interface ChatMessage {
  role: ChatRole
  content: string
}

const messages = ref<ChatMessage[]>([])
const input = ref('')
const error = ref('')
const isStreaming = ref(false)
let abortController: AbortController | undefined

const canSubmit = computed(() => input.value.trim().length > 0 && !isStreaming.value)

function newConversation() {
  abortController?.abort()
  messages.value = []
  input.value = ''
  error.value = ''
}

function stopStreaming() {
  abortController?.abort()
}

function parseEvent(event: string): string | undefined {
  const data = event
    .split('\n')
    .filter(line => line.startsWith('data:'))
    .map(line => line.slice(5).trim())
    .join('\n')

  if (!data || data === '[DONE]') {
    return undefined
  }

  try {
    const payload = JSON.parse(data) as { response?: string }
    return payload.response
  } catch {
    return undefined
  }
}

async function sendMessage() {
  if (!canSubmit.value) {
    return
  }

  const content = input.value.trim()
  input.value = ''
  error.value = ''
  const assistantMessage: ChatMessage = { role: 'assistant', content: '' }
  messages.value.push({ role: 'user', content }, assistantMessage)
  abortController = new AbortController()
  isStreaming.value = true

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages: messages.value.slice(0, -1) }),
      signal: abortController.signal
    })

    if (!response.ok || !response.body) {
      if (response.headers.get('content-type')?.includes('application/json')) {
        const body = await response.json() as { error?: string }
        throw new Error(body.error || 'The chat service is unavailable.')
      }
      throw new Error('The chat service is unavailable.')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffered = ''

    while (true) {
      const { done, value } = await reader.read()
      buffered += decoder.decode(value || new Uint8Array(), { stream: !done })

      const events = buffered.split('\n\n')
      buffered = events.pop() || ''
      for (const event of events) {
        assistantMessage.content += parseEvent(event) || ''
      }

      if (done) {
        assistantMessage.content += parseEvent(buffered) || ''
        break
      }
    }

    if (!assistantMessage.content) {
      throw new Error('The AI service returned an empty response.')
    }
  } catch (cause) {
    messages.value = messages.value.filter(message => message !== assistantMessage)
    if (cause instanceof DOMException && cause.name === 'AbortError') {
      return
    }
    error.value = cause instanceof Error ? cause.message : 'The chat service is unavailable.'
  } finally {
    isStreaming.value = false
    abortController = undefined
  }
}
</script>

<template>
  <main class="min-h-screen bg-default">
    <UContainer class="flex min-h-screen max-w-4xl flex-col py-4 sm:py-8">
      <header class="mb-6 flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-primary">
            Airton
          </p>
          <h1 class="text-xl font-semibold text-highlighted">
            Business intelligence, in conversation
          </h1>
        </div>

        <div class="flex items-center gap-2">
          <UColorModeButton />
          <UButton
            label="New chat"
            icon="i-lucide-plus"
            color="neutral"
            variant="outline"
            :disabled="isStreaming"
            @click="newConversation"
          />
        </div>
      </header>

      <section
        aria-live="polite"
        class="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto"
      >
        <UAlert
          v-if="messages.length === 0"
          icon="i-lucide-sparkles"
          title="Start a conversation"
          description="Ask for help shaping an ideal customer profile, planning outreach, or evaluating a market."
          color="primary"
          variant="subtle"
        />

        <article
          v-for="(message, index) in messages"
          :key="`${message.role}-${index}`"
          class="max-w-[85%] rounded-xl px-4 py-3 text-sm leading-6"
          :class="message.role === 'user'
            ? 'ml-auto bg-primary text-inverted'
            : 'bg-elevated text-default'"
        >
          <p class="mb-1 text-xs font-semibold opacity-70">
            {{ message.role === 'user' ? 'You' : 'Airton' }}
          </p>
          <p
            v-if="message.content"
            class="whitespace-pre-wrap"
          >
            {{ message.content }}
          </p>
          <UIcon
            v-else
            name="i-lucide-loader-circle"
            class="size-4 animate-spin"
            aria-label="Generating response"
          />
        </article>
      </section>

      <footer class="pt-6">
        <UAlert
          v-if="error"
          class="mb-3"
          color="error"
          icon="i-lucide-circle-alert"
          title="Message not sent"
          :description="error"
          :close="{ onClick: () => { error = '' } }"
        />

        <form
          class="rounded-xl border border-muted bg-elevated p-3 shadow-sm"
          @submit.prevent="sendMessage"
        >
          <UTextarea
            v-model="input"
            aria-label="Message Airton"
            placeholder="Ask a business question..."
            :rows="3"
            :disabled="isStreaming"
            autoresize
            @keydown.enter.exact.prevent="sendMessage"
          />

          <div class="mt-3 flex items-center justify-between gap-3">
            <p class="text-xs text-muted">
              Responses are general guidance in this first phase.
            </p>
            <UButton
              v-if="isStreaming"
              label="Stop"
              icon="i-lucide-square"
              color="neutral"
              variant="outline"
              type="button"
              @click="stopStreaming"
            />
            <UButton
              v-else
              label="Send"
              icon="i-lucide-arrow-up"
              type="submit"
              :disabled="!canSubmit"
            />
          </div>
        </form>
      </footer>
    </UContainer>
  </main>
</template>
