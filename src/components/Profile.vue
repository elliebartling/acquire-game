<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { AVATAR_COLORS, DEFAULT_AVATAR_COLOR } from '@/constants/avatarColors'
import {
  ADVENTURER_NEUTRAL_SCHEMA,
  buildDicebearOptions,
  generateAvatarAssets,
  serializeAvatarOptions
} from '@/utils/avatarGenerator'

const props = defineProps({
  profile: {
    type: Object,
    required: true
  }
})

const authStore = useAuthStore()
const user = computed(() => authStore.user)

const optionSchemas = ADVENTURER_NEUTRAL_SCHEMA?.properties || {}
const FACIAL_KEYS = ['eyebrows', 'eyes', 'glasses', 'mouth']
const optionValues = reactive(
  FACIAL_KEYS.reduce((acc, key) => {
    acc[key] = ''
    return acc
  }, {})
)

const colorOptions = AVATAR_COLORS
const tabConfig = [
  { id: 'background', label: 'Background Color' },
  ...FACIAL_KEYS.map((key) => ({
    id: key,
    label: key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())
  }))
]

const state = reactive({
  username: '',
  seedInput: '',
  colorHex: DEFAULT_AVATAR_COLOR.hex,
  avatarPreview: '',
  resolvedSeed: '',
  resolvedOptions: {},
  previewLoading: false,
  isSaving: false,
  error: '',
  activeTab: tabConfig[0].id
})

const styleControls = computed(() =>
  FACIAL_KEYS.map((key) => {
    const schema = optionSchemas[key]
    if (!schema) return null
    return {
      key,
      schema,
      label: key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())
    }
  }).filter(Boolean)
)

const ensureColorHex = (value) => {
  if (!value) return DEFAULT_AVATAR_COLOR.hex
  return value.startsWith('#') ? value : `#${value}`
}

const hydrateOptionValues = (options = {}) => {
  FACIAL_KEYS.forEach((key) => {
    const schema = optionSchemas[key]
    if (!schema) return
    const value = options[key]

    if (schema.type === 'integer' || schema.type === 'number') {
      optionValues[key] =
        typeof value === 'number' ? value : schema.default ?? 0
    } else if (schema.type === 'array') {
      optionValues[key] =
        Array.isArray(value) && value.length ? value[0] : ''
    } else {
      optionValues[key] = value ?? ''
    }
  })
}

const hydrateForm = (profile = {}) => {
  const sanitizedOptions = serializeAvatarOptions(profile?.avatar_options || {})
  state.username = profile?.username || ''
  state.seedInput = profile?.avatar_seed || ''
  state.colorHex = ensureColorHex(sanitizedOptions.backgroundColor?.[0])
  state.avatarPreview = profile?.avatar_preview || profile?.avatar_url || ''
  state.resolvedSeed = profile?.avatar_seed || ''
  state.resolvedOptions = sanitizedOptions
  hydrateOptionValues(sanitizedOptions)
}

const buildOverrides = (custom) => {
  const overrides = {}
  Object.entries(optionValues).forEach(([key, value]) => {
    const schema = optionSchemas[key]
    if (!schema) return

    if (schema.type === 'array') {
      if (value && value.length) {
        overrides[key] = Array.isArray(value) ? value : [value]
      }
    } else if (schema.type === 'integer' || schema.type === 'number') {
      overrides[key] = Number(value)
    } else if (value !== '') {
      overrides[key] = value
    }
  })
  return {
    ...overrides,
    ...(custom || {})
  }
}

let previewToken = 0
let variantPreviewToken = 0
let variantPreviewTimeout
const variantPreviews = reactive(
  FACIAL_KEYS.reduce((acc, key) => {
    acc[key] = {}
    return acc
  }, {})
)
const variantPreviewState = reactive({
  loading: false
})

const updatePreview = async () => {
  previewToken += 1
  const token = previewToken
  state.previewLoading = true
  try {
    const overrides = buildOverrides()
    const { seed, options } = buildDicebearOptions({
      username: state.username,
      seedOverride: state.seedInput,
      storedOptions: overrides,
      colorHex: state.colorHex
    })
    const serialized = serializeAvatarOptions(options)
    const assets = await generateAvatarAssets({ seed, options: serialized })

    if (token !== previewToken) return

    state.resolvedSeed = seed
    state.resolvedOptions = serialized
    state.avatarPreview = assets.dataUri
  } catch (error) {
    console.error('Failed to update avatar preview', error)
  } finally {
    if (token === previewToken) {
      state.previewLoading = false
    }
  }
}

const handleColorSelect = (hex) => {
  state.colorHex = hex
}

const setActiveTab = (tabId) => {
  state.activeTab = tabId
}

const selectVariant = (key, variant) => {
  optionValues[key] = variant || ''
}

const handleSubmit = async () => {
  state.isSaving = true
  state.error = ''
  try {
    await authStore.updateUserProfile({
      username: state.username,
      avatar_seed: state.resolvedSeed,
      avatar_options: state.resolvedOptions,
      avatar_color_hex: state.colorHex
    })
  } catch (error) {
    console.error(error)
    state.error = error.message || 'Unable to update profile'
  } finally {
    state.isSaving = false
  }
}

const generateVariantPreviews = async () => {
  variantPreviewToken += 1
  const token = variantPreviewToken
  variantPreviewState.loading = true
  const baseOverrides = buildOverrides()

  try {
    const tasks = []

    FACIAL_KEYS.forEach((key) => {
      const schema = optionSchemas[key]
      const variants = schema?.items?.enum || []
      variants.forEach((variant) => {
        tasks.push(
          (async () => {
            const overrides = {
              ...baseOverrides,
              [key]: [variant]
            }
            const { seed, options } = buildDicebearOptions({
              username: state.username,
              seedOverride: state.seedInput,
              storedOptions: serializeAvatarOptions({
                ...state.resolvedOptions,
                ...overrides
              }),
              colorHex: state.colorHex
            })
            const serialized = serializeAvatarOptions(options)
            const assets = await generateAvatarAssets({ seed, options: serialized })
            if (token === variantPreviewToken) {
              variantPreviews[key][variant] = assets.dataUri
            }
          })()
        )
      })
    })

    await Promise.all(tasks)
  } catch (error) {
    console.error('Failed to generate variant previews', error)
  } finally {
    if (token === variantPreviewToken) {
      variantPreviewState.loading = false
    }
  }
}

const scheduleVariantPreviews = () => {
  if (variantPreviewTimeout) {
    clearTimeout(variantPreviewTimeout)
  }
  variantPreviewTimeout = setTimeout(() => {
    generateVariantPreviews()
  }, 200)
}

hydrateForm(props.profile)

watch(
  () => props.profile,
  (newProfile) => {
    hydrateForm(newProfile || {})
    updatePreview()
    scheduleVariantPreviews()
  },
  { deep: true }
)

watch(
  () => [state.username, state.seedInput, state.colorHex],
  () => {
    updatePreview()
    scheduleVariantPreviews()
  }
)

watch(
  optionValues,
  () => updatePreview(),
  { deep: true }
)

onMounted(() => {
  updatePreview()
  generateVariantPreviews()
})

onBeforeUnmount(() => {
  if (variantPreviewTimeout) {
    clearTimeout(variantPreviewTimeout)
  }
})
</script>

<template>
  <form class="form-widget py-6 space-y-6" @submit.prevent="handleSubmit">
    <div>
      <label class="label" for="email">Email</label>
      <input
        id="email"
        class="input text-gray-500"
        type="text"
        :value="user?.email || ''"
        disabled
      />
      <p class="mt-2 text-sm text-gray-500">
        Emails are fixed after signup; we show it here for reference.
      </p>
    </div>

    <div>
      <label class="label" for="username">Username</label>
      <input
        id="username"
        class="input"
        v-model.trim="state.username"
        type="text"
        placeholder="Your display name"
      />
      <p class="mt-2 text-sm text-gray-500">Usernames help friends find you.</p>
    </div>

    <div class="flex items-center gap-4">
      <div class="relative h-24 w-24">
        <img
          v-if="state.avatarPreview"
          :src="state.avatarPreview"
          alt="Avatar preview"
          class="h-24 w-24 rounded-full border border-gray-200 shadow-sm"
        />
        <div
          v-else
          class="h-24 w-24 rounded-full border border-dashed border-gray-300"
        ></div>
        <div
          v-if="state.previewLoading"
          class="absolute inset-0 flex items-center justify-center rounded-full bg-white/70 text-xs font-medium text-gray-600"
        >
          Generating…
        </div>
      </div>
    </div>

    <div>
      <div class="flex border-b border-gray-200 mb-4 gap-2 overflow-x-auto">
        <button
          v-for="tab in tabConfig"
          :key="tab.id"
          type="button"
          class="px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap"
          :class="state.activeTab === tab.id ? 'border-violet-500 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700'"
          @click="setActiveTab(tab.id)"
        >
          {{ tab.label }}
        </button>
      </div>

      <div v-if="state.activeTab === 'background'" class="flex flex-wrap gap-3">
        <button
          v-for="color in colorOptions"
          :key="color.hex"
          type="button"
          class="h-10 w-10 rounded-full border-2"
          :class="{
            'border-violet-600 ring-2 ring-violet-300': state.colorHex === color.hex,
            'border-transparent': state.colorHex !== color.hex
          }"
          :style="{ backgroundColor: color.hex }"
          @click="handleColorSelect(color.hex)"
        >
          <span class="sr-only">{{ color.name }}</span>
        </button>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="control in styleControls.filter((control) => control.key === state.activeTab)"
          :key="control.key"
          class="space-y-3"
        >
          <div class="flex flex-wrap gap-3">
            <button
              v-for="variant in control.schema.items?.enum || []"
              :key="variant"
              type="button"
              class="flex h-16 w-16 items-center justify-center rounded-full border transition"
              :class="{
                'border-violet-600 ring-2 ring-violet-300':
                  optionValues[control.key] === variant,
                'border-gray-200 hover:border-gray-400':
                  optionValues[control.key] !== variant
              }"
              @click="selectVariant(control.key, variant)"
            >
              <img
                v-if="variantPreviews[control.key][variant]"
                :src="variantPreviews[control.key][variant]"
                alt=""
                class="h-14 w-14 rounded-full"
              />
              <span v-else class="text-[10px] text-gray-500">…</span>
            </button>
          </div>

          <p class="text-xs text-gray-500">
            Choose a specific variant or leave on Random for dice roll.
          </p>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap gap-4 items-center">
      <button
        type="submit"
        class="button primary hover:bg-violet-600 disabled:opacity-50"
        :disabled="state.isSaving || state.previewLoading"
      >
        {{ state.isSaving ? 'Saving…' : 'Update profile' }}
      </button>
      <button
        type="button"
        class="button secondary hover:bg-violet-600 hover:text-white"
        :disabled="state.isSaving"
        @click="authStore.signOut()"
      >
        Sign Out
      </button>
      <span v-if="state.error" class="text-sm text-rose-600">{{ state.error }}</span>
    </div>
  </form>
</template>

