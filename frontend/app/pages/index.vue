<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()

const company = ref('')
const segment = ref('')
const notes = ref('')
const reply = ref('')
const error = ref('')
const loading = ref(false)

const features = [
  {
    title: 'Workers AI backend',
    description: 'Minimal chat endpoint ready for Cloudflare AI bindings.'
  },
  {
    title: 'Nuxt UI frontend',
    description: 'Simple interface to discuss the MVP and test prompts quickly.'
  },
  {
    title: 'Business prospection focus',
    description: 'The initial prompt targets outreach, qualification, and lead messaging.'
  }
]

async function generateDraft() {
  error.value = ''
  reply.value = ''

  if (!company.value.trim() || !segment.value.trim()) {
    error.value = 'Add a company name and target segment to generate a first draft.'
    return
  }

  loading.value = true

  try {
    const response = await $fetch<{ reply: string }>(`${runtimeConfig.public.apiBaseUrl}/api/chat`, {
      method: 'POST',
      body: {
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant that drafts concise business prospection messages.'
          },
          {
            role: 'user',
            content: `Create an outreach opener for ${company.value.trim()} targeting ${segment.value.trim()}. Extra context: ${notes.value.trim() || 'None.'}`
          }
        ]
      }
    })

    reply.value = response.reply
  } catch {
    error.value = 'The backend is not reachable yet. Start the worker or set NUXT_PUBLIC_API_BASE_URL.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UContainer class="py-16 space-y-12">
    <UPageHero
      title="Airton MVP skeleton"
      description="A Cloudflare-first starting point for a business prospection chat assistant, with a Workers AI backend and a Nuxt UI frontend."
      :links="[{
        label: 'Backend health',
        to: `${runtimeConfig.public.apiBaseUrl}/health`,
        target: '_blank',
        trailingIcon: 'i-lucide-arrow-right'
      }]"
    />

    <UPageSection
      title="What is already in place"
      description="This repo is intentionally small: just enough structure to start discussing the MVP across frontend, backend, and AI instructions."
      :features="features"
    />

    <UPageSection
      title="Try a first prospection draft"
      description="Use the form below to exercise the intended frontend-to-backend flow."
    >
      <UCard class="max-w-3xl">
        <div class="space-y-4">
          <UFormField label="Company">
            <UInput
              v-model="company"
              placeholder="Acme Corp"
            />
          </UFormField>

          <UFormField label="Target segment">
            <UInput
              v-model="segment"
              placeholder="Operations leaders at SaaS companies"
            />
          </UFormField>

          <UFormField label="Extra context">
            <UTextarea
              v-model="notes"
              :rows="4"
              placeholder="Product angle, pain points, region, or ICP notes"
            />
          </UFormField>

          <div class="flex flex-wrap gap-3">
            <UButton
              :loading="loading"
              icon="i-lucide-arrow-right"
              @click="generateDraft"
            >
              Generate draft
            </UButton>
            <UBadge
              color="neutral"
              variant="subtle"
            >
              API base: {{ runtimeConfig.public.apiBaseUrl }}
            </UBadge>
          </div>

          <UAlert
            v-if="error"
            color="warning"
            variant="subtle"
            title="Backend connection"
            :description="error"
          />

          <UCard
            v-if="reply"
            variant="subtle"
          >
            <template #header>
              <div class="font-medium">
                Assistant reply
              </div>
            </template>

            <p class="whitespace-pre-wrap">
              {{ reply }}
            </p>
          </UCard>
        </div>
      </UCard>
    </UPageSection>
  </UContainer>
</template>
