// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { SYSTEM_PROMPT, SYSTEM_PROMPT_FUN } from '@/config/prompt'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export const generateAIResponse = async (
  messages: { content: string; sender: 'user' | 'ai' }[]
) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-8b' })

    // Convert chat history to Gemini format
    const chat = model.startChat({
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7
      }
    })

    // Send system prompt first
    await chat.sendMessage(SYSTEM_PROMPT_FUN)

    // Send each message in sequence to build context
    for (let i = 0; i < messages.length - 1; i++) {
      const msg = messages[i]
      await chat.sendMessage(msg.content)
    }

    // Send final message and get response
    const lastMessage = messages[messages.length - 1]
    const result = await chat.sendMessage(lastMessage.content)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Error generating AI response:', error)
    throw error
  }
}
