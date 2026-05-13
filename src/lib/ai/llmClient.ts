import OpenAI from 'openai'

interface ChatProvider {
  name: string
  apiKey: string
  baseURL?: string
  mainModel: string
  evaluatorModel: string
}

interface EmbeddingProvider {
  name: string
  model: string
  embedOne: (text: string) => Promise<number[]>
  embedMany: (texts: string[]) => Promise<number[][]>
}

const clients = new Map<string, OpenAI>()

function envFlag(name: string, defaultValue: boolean): boolean {
  const value = process.env[name]
  if (value === undefined) return defaultValue
  return !['0', 'false', 'no', 'off'].includes(value.toLowerCase())
}

export function isValidJsonObject(text: string): boolean {
  try {
    const cleaned = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim()
    const parsed = JSON.parse(cleaned)
    return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
  } catch {
    try {
      const match = text.match(/\{[\s\S]*\}/)
      if (!match) return false
      const parsed = JSON.parse(match[0])
      return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
    } catch {
      return false
    }
  }
}

function addProvider(
  providers: ChatProvider[],
  provider: ChatProvider | null,
) {
  if (provider) providers.push(provider)
}

function getChatProviders(): ChatProvider[] {
  const providers: ChatProvider[] = []

  if (envFlag('OLLAMA_ENABLED', true)) {
    const ollamaModel = process.env.OLLAMA_MODEL ?? 'qwen2.5-coder:3b'
    addProvider(providers, {
      name: 'ollama',
      apiKey: process.env.OLLAMA_API_KEY ?? 'ollama',
      baseURL: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434/v1',
      mainModel: process.env.OLLAMA_MAIN_MODEL ?? ollamaModel,
      evaluatorModel: process.env.OLLAMA_EVALUATOR_MODEL ?? ollamaModel,
    })
  }

  if (process.env.GEMINI_API_KEY) {
    addProvider(providers, {
      name: 'gemini',
      apiKey: process.env.GEMINI_API_KEY,
      baseURL:
        process.env.GEMINI_BASE_URL ??
        'https://generativelanguage.googleapis.com/v1beta/openai/',
      mainModel: process.env.GEMINI_MAIN_MODEL ?? 'gemini-2.0-flash',
      evaluatorModel: process.env.GEMINI_EVALUATOR_MODEL ?? 'gemini-2.0-flash',
    })
  }

  if (process.env.OPENROUTER_API_KEY) {
    addProvider(providers, {
      name: 'openrouter',
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1',
      mainModel: process.env.OPENROUTER_MAIN_MODEL ?? 'openrouter/free',
      evaluatorModel:
        process.env.OPENROUTER_EVALUATOR_MODEL ?? 'openrouter/free',
    })
  }

  // Backwards-compatible OpenAI/OpenAI-compatible provider. Existing .env files
  // that point OPENAI_BASE_URL at Gemini, Groq, Ollama, etc. still work.
  if (process.env.OPENAI_API_KEY) {
    addProvider(providers, {
      name: process.env.OPENAI_PROVIDER_NAME ?? 'openai-compatible',
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL,
      mainModel: process.env.MAIN_LLM_MODEL ?? 'gpt-4o-mini',
      evaluatorModel: process.env.EVALUATOR_LLM_MODEL ?? 'gpt-4o-mini',
    })
  }

  return providers
}

function getClient(provider: ChatProvider): OpenAI {
  const key = `${provider.name}:${provider.baseURL ?? 'default'}`
  const cached = clients.get(key)
  if (cached) return cached

  const client = new OpenAI({
    apiKey: provider.apiKey,
    baseURL: provider.baseURL,
  })
  clients.set(key, client)
  return client
}

async function fetchJson<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, init)
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText)
    throw new Error(`${response.status} ${response.statusText}: ${message.slice(0, 300)}`)
  }
  return response.json() as Promise<T>
}

export async function chatComplete(
  prompt: string,
  model?: string,
  systemPrompt?: string,
  acceptContent?: (content: string) => boolean,
): Promise<string> {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = []
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt })
  messages.push({ role: 'user', content: prompt })

  const providers = getChatProviders()
  if (providers.length === 0) {
    throw new Error('No chat providers configured')
  }

  const failures: string[] = []

  for (const provider of providers) {
    const resolvedModel =
      model ??
      (systemPrompt ? provider.mainModel : provider.evaluatorModel)

    try {
      const response = await getClient(provider).chat.completions.create({
        model: resolvedModel,
        messages,
        temperature: 0.2,
        max_tokens: Number(process.env.LLM_MAX_TOKENS ?? 2000),
      })

      const content = response.choices[0]?.message?.content ?? ''
      if (content.trim() && (!acceptContent || acceptContent(content))) {
        console.info(`[llmClient] chatComplete succeeded with ${provider.name}:${resolvedModel}`)
        return content
      }
      failures.push(`${provider.name}:${resolvedModel} returned unusable content`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      failures.push(`${provider.name}:${resolvedModel} failed: ${message}`)
      console.warn(`[llmClient] ${failures[failures.length - 1]}`)
    }
  }

  throw new Error(`All chat providers failed. ${failures.join(' | ')}`)
}

const LOCAL_EMBED_DIM = 256

function localEmbed(text: string): number[] {
  const v = new Array<number>(LOCAL_EMBED_DIM).fill(0)
  const tokens = text.toLowerCase().match(/[a-z0-9]+/g) ?? []
  for (const tok of tokens) {
    let h = 2166136261
    for (let i = 0; i < tok.length; i++) {
      h = Math.imul(h ^ tok.charCodeAt(i), 16777619)
    }
    v[Math.abs(h) % LOCAL_EMBED_DIM] += 1
  }
  let norm = 0
  for (const x of v) norm += x * x
  norm = Math.sqrt(norm) || 1
  return v.map((x) => x / norm)
}

function createOllamaEmbeddingProvider(): EmbeddingProvider | null {
  if (!envFlag('OLLAMA_EMBEDDINGS_ENABLED', envFlag('OLLAMA_ENABLED', true))) return null

  const baseUrl = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434/v1'
  const apiUrl = baseUrl.replace(/\/v1\/?$/, '')
  const model = process.env.OLLAMA_EMBEDDING_MODEL ?? 'nomic-embed-text:latest'

  async function embedOne(text: string): Promise<number[]> {
    const response = await fetchJson<{ embedding: number[] }>(`${apiUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt: text }),
    })
    return response.embedding
  }

  async function embedMany(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = []
    for (const text of texts) {
      embeddings.push(await embedOne(text))
    }
    return embeddings
  }

  return { name: 'ollama', model, embedOne, embedMany }
}

function createOpenAIEmbeddingProvider(): EmbeddingProvider | null {
  if (!process.env.OPENAI_API_KEY) return null

  const model = process.env.EMBEDDING_MODEL ?? 'text-embedding-3-small'
  const client = getClient({
    name: process.env.OPENAI_PROVIDER_NAME ?? 'embedding',
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
    mainModel: process.env.MAIN_LLM_MODEL ?? 'gpt-4o-mini',
    evaluatorModel: process.env.EVALUATOR_LLM_MODEL ?? 'gpt-4o-mini',
  })

  return {
    name: process.env.OPENAI_PROVIDER_NAME ?? 'openai-compatible',
    model,
    async embedOne(text: string): Promise<number[]> {
      const response = await client.embeddings.create({ model, input: text })
      return response.data[0].embedding
    },
    async embedMany(texts: string[]): Promise<number[][]> {
      const response = await client.embeddings.create({ model, input: texts })
      return response.data.map((d) => d.embedding)
    },
  }
}

function getEmbeddingProviders(): EmbeddingProvider[] {
  return [createOllamaEmbeddingProvider(), createOpenAIEmbeddingProvider()].filter(
    (provider): provider is EmbeddingProvider => provider !== null,
  )
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const failures: string[] = []
  for (const provider of getEmbeddingProviders()) {
    try {
      const embedding = await provider.embedOne(text)
      if (embedding.length > 0) {
        console.info(`[llmClient] generateEmbedding succeeded with ${provider.name}:${provider.model}`)
        return embedding
      }
      failures.push(`${provider.name}:${provider.model} returned an empty embedding`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      failures.push(`${provider.name}:${provider.model} failed: ${message}`)
    }
  }

  if (failures.length > 0) {
    console.warn(`[llmClient] all embedding providers failed, using hash fallback: ${failures.join(' | ')}`)
  } else {
    console.warn('[llmClient] no embedding providers configured, using hash fallback')
  }
  return localEmbed(text)
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return []

  const failures: string[] = []
  for (const provider of getEmbeddingProviders()) {
    try {
      const embeddings = await provider.embedMany(texts)
      if (embeddings.length === texts.length && embeddings.every((embedding) => embedding.length > 0)) {
        console.info(`[llmClient] generateEmbeddings succeeded with ${provider.name}:${provider.model}`)
        return embeddings
      }
      failures.push(`${provider.name}:${provider.model} returned incomplete embeddings`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      failures.push(`${provider.name}:${provider.model} failed: ${message}`)
    }
  }

  if (failures.length > 0) {
    console.warn(`[llmClient] all embedding providers failed, using hash fallback: ${failures.join(' | ')}`)
  } else {
    console.warn('[llmClient] no embedding providers configured, using hash fallback')
  }
  return texts.map(localEmbed)
}
