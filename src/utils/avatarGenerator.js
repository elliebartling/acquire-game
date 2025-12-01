import { createAvatar, schema as coreSchema } from '@dicebear/core'
import { adventurerNeutral } from '@dicebear/collection'
import { AVATAR_COLORS, DEFAULT_AVATAR_COLOR } from '@/constants/avatarColors'

const STYLE_NAME = 'adventurerNeutral'
const FALLBACK_SEED = 'Acquire Player'

const styleSchema = adventurerNeutral?.schema || {}

export const ADVENTURER_NEUTRAL_SCHEMA = {
  ...styleSchema,
  properties: {
    ...(coreSchema?.properties || {}),
    ...(styleSchema?.properties || {})
  }
}

const sanitizeHex = (hex = DEFAULT_AVATAR_COLOR.hex) =>
  hex.replace('#', '').trim().toLowerCase()

const hashString = (value = '') => {
  let hash = 0
  const input = value || FALLBACK_SEED
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0 // Convert to 32bit integer
  }
  return Math.abs(hash)
}

export const pickColorForSeed = (seed = '') => {
  const index = hashString(seed) % AVATAR_COLORS.length
  return AVATAR_COLORS[index]
}

export const normalizeSeed = ({ username, seedOverride, storedSeed }) => {
  const candidate = seedOverride || storedSeed || username || ''
  const normalized = candidate.trim()
  return normalized.length ? normalized : FALLBACK_SEED
}

export const buildDicebearOptions = ({
  username,
  seedOverride,
  storedSeed,
  colorHex,
  storedOptions = {},
  overrides = {}
}) => {
  const seed = normalizeSeed({ username, seedOverride, storedSeed })
  const preferredColor =
    colorHex ||
    storedOptions?.backgroundColor?.[0] ||
    pickColorForSeed(seed).hex

  const backgroundColor = [sanitizeHex(preferredColor)]

  return {
    seed,
    options: {
      ...storedOptions,
      backgroundColor,
      ...overrides
    }
  }
}

export const serializeAvatarOptions = (options = {}) => {
  if (!options || typeof options !== 'object') {
    return {}
  }

  const backgroundColor = Array.isArray(options.backgroundColor)
    ? options.backgroundColor.map((hex) => sanitizeHex(hex))
    : [sanitizeHex()]

  return {
    ...options,
    backgroundColor
  }
}

export const deserializeAvatarOptions = (options = {}) => {
  if (!options || typeof options !== 'object') {
    return {}
  }

  const backgroundColor = Array.isArray(options.backgroundColor)
    ? options.backgroundColor.map((hex) => sanitizeHex(hex))
    : []

  return {
    ...options,
    backgroundColor
  }
}

export const generateAvatarAssets = async ({ seed, options }) => {
  const avatar = createAvatar(adventurerNeutral, {
    seed,
    ...options
  })

  return {
    svg: avatar.toString(),
    dataUri: await avatar.toDataUri()
  }
}

export const getDicebearStyleName = () => STYLE_NAME



