import Anthropic from '@anthropic-ai/sdk'

export function createAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set')
  }

  return new Anthropic({
    apiKey,
  })
}

export const AI_MODEL = 'claude-opus-4-6'
export const AI_MAX_TOKENS = 4096
