// lib/models.ts
export const MODELS = [
  {
    id: 'meta-llama/llama-3.1-405b-instruct',
    name: 'LLaMA 3.1',
    company: 'Meta',
    supports: [],
  },
  {
    id: 'meta-llama/llama-4-maverick',
    name: 'LLaMA 4 Maverick',
    company: 'Meta',
    supports: [],
  },
  {
    id: 'mistralai/devstral-small',
    name: 'DevStral Small',
    company: 'Mistral AI',
    supports: [],
  },
  {
    id: 'mistralai/mistral-7b-instruct-v0.2',
    name: 'Mistral 7B Instruct v0.2',
    company: 'Mistral AI',
    supports: ['document'],
  },
  {
    id: 'mistralai/mixtral-8x22b',
    name: 'Mixtral 8x22B',
    company: 'Mistral AI',
    supports: ['document'],
  },
  {
    id: 'deepseek/deepseek-r1-0528:free',
    name: 'DeepSeek R1',
    company: 'DeepSeek',
    supports: ['image'],
  },
  {
    id: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
    name: 'DeepSeek Qwen 8B',
    company: 'DeepSeek',
    supports: ['image', 'document'],
  },
  {
    id: 'sarvamai/sarvam-m',
    name: 'Sarvam M',
    company: 'SarvamAI',
    supports: ['document'],
  },
  {
    id: 'opengvlab/internvl3-14b:free',
    name: 'InternVL3 14B',
    company: 'OpenGVLab',
    supports: ['document'],
  },
  {
    id: 'google/gemini-2.5-flash-preview-05-20',
    name: 'Gemini 2.5 Flash (Preview)',
    company: 'Google',
    supports: ['document'],
  },
  {
    id: 'google/gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    company: 'Google',
    supports: ['image', 'document', 'code'],
  },
  {
    id: 'anthropic/claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    company: 'Anthropic',
    supports: ['image', 'document'],
  },
  {
    id: 'anthropic/claude-3-sonnet-20240229',
    name: 'Claude 3 Sonnet',
    company: 'Anthropic',
    supports: ['image', 'document'],
  },
  {
    id: 'openai/o3-mini-2025-01-31',
    name: 'o3 Mini',
    company: 'OpenAI',
    supports: ['document'],
  },
  {
    id: 'openai/gpt-4.1-2025-04-14',
    name: 'GPT-4.1',
    company: 'OpenAI',
    supports: ['document'],
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    company: 'OpenAI',
    supports: ['image', 'audio', 'video', 'document', 'code'],
  },
];
