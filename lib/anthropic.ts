import Anthropic from '@anthropic-ai/sdk'
import type { OcrResult, MemoResult } from './types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function extractCardInfo(base64Image: string, mediaType: string): Promise<OcrResult> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mediaType as any, data: base64Image } },
        { type: 'text', text: 'この名刺画像から情報を抽出してください。以下のJSON形式のみで返答してください（コードブロック不要）：{"name":"氏名","company":"会社名","title":"役職","email":"メール","phone":"電話","address":"住所","website":"URL"} 読み取れない項目はnullにしてください。' }
      ]
    }]
  })
  const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
  try { return JSON.parse(text) } catch { return { name:null,company:null,title:null,email:null,phone:null,address:null,website:null } }
}

export async function processMemo(rawMemo: string, cardInfo: OcrResult): Promise<MemoResult> {
  const today = new Date().toISOString().split('T')[0]
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `今日: ${today}\n名刺: ${JSON.stringify(cardInfo)}\n音声メモ: "${rawMemo}"\n\n以下のJSON形式のみで返答（コードブロック不要）：{"memo":"整理されたメモ","tags":["タグ1","タグ2"],"met_at":"ISO8601orNull","follow_up_at":"ISO8601orNull"}`
    }]
  })
  const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
  try { return JSON.parse(text) } catch { return { memo: rawMemo, tags: [], met_at: null, follow_up_at: null } }
}
