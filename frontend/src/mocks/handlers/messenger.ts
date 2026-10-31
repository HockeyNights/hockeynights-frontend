import {http, HttpResponse} from 'msw'

import type {
  ChannelSettingsPatch,
  CreateChatPayload,
  CreateChatTopicPayload,
  ResolveMessageActionPayload,
} from '@/entities/messenger'
import {resolveMockMessageAction} from '@/mocks/data/messageActions'
import {
  appendMockMessage,
  createDirectMockChat,
  createMockChannelOrChat,
  createMockTopic,
  getMockChannelSettings,
  getMockMessages,
  getMockVisibleTopics,
  mockChats,
  mockChatUsers,
  openMockDiscoverableChat,
  patchMockChannelSettings,
  searchMockDiscoverableChats,
  toggleMockChatPin,
} from '@/mocks/data/messenger'

/** @spec SPEC-FR-16.1.1, SPEC-FR-16.1.2, SPEC-FR-16.1.3 */
export const messengerHandlers = [
  http.get('/mock-api/v1/messenger/chats', ({request}) => {
    const teamId = new URL(request.url).searchParams.get('teamId')?.trim()
    if (teamId) {
      return HttpResponse.json(mockChats.filter((chat) => chat.relatedEntityId === teamId))
    }
    return HttpResponse.json(mockChats)
  }),

  http.get('/mock-api/v1/messenger/chats/discover', ({request}) => {
    const query = new URL(request.url).searchParams.get('query') ?? ''
    return HttpResponse.json(searchMockDiscoverableChats(query))
  }),

  http.post('/mock-api/v1/messenger/chats/:chatId/open', ({params}) => {
    const chat = openMockDiscoverableChat(params.chatId as string)
    if (!chat) {
      return HttpResponse.json({message: 'Public chat not found'}, {status: 404})
    }
    return HttpResponse.json(chat)
  }),

  http.get('/mock-api/v1/messenger/users', ({request}) => {
    const query = new URL(request.url).searchParams.get('query')?.toLowerCase().trim()
    const users = !query
      ? mockChatUsers
      : mockChatUsers.filter((user) => user.displayName.toLowerCase().includes(query))
    return HttpResponse.json(users)
  }),

  http.post('/mock-api/v1/messenger/chats', async ({request}) => {
    const body = (await request.json()) as {targetUserId?: string} & Partial<CreateChatPayload>
    if (body.targetUserId) {
      const chat = createDirectMockChat(body.targetUserId)
      if (!chat) {
        return HttpResponse.json({message: 'Target user not found'}, {status: 404})
      }
      return HttpResponse.json(chat)
    }
    if (!body.type || !body.title) {
      return HttpResponse.json({message: 'type and title are required'}, {status: 400})
    }
    const chat = createMockChannelOrChat(body as CreateChatPayload)
    return HttpResponse.json(chat)
  }),

  http.patch('/mock-api/v1/messenger/chats/:chatId/pin', async ({params, request}) => {
    const body = (await request.json().catch(() => ({}))) as {pinned?: boolean}
    const chat = toggleMockChatPin(params.chatId as string, body.pinned)
    if (!chat) {
      return HttpResponse.json({message: 'Chat not found'}, {status: 404})
    }
    return HttpResponse.json(chat)
  }),

  http.get('/mock-api/v1/messenger/chats/:chatId/topics', ({params}) => {
    const topics = getMockVisibleTopics(params.chatId as string)
    return HttpResponse.json(topics)
  }),

  http.post('/mock-api/v1/messenger/chats/:chatId/topics', async ({params, request}) => {
    const body = (await request.json()) as CreateChatTopicPayload
    if (!body.title?.trim()) {
      return HttpResponse.json({message: 'title is required'}, {status: 400})
    }
    const topic = createMockTopic(params.chatId as string, body)
    return HttpResponse.json(topic)
  }),

  http.post('/mock-api/v1/messenger/chats/:chatId/messages', async ({params, request}) => {
    const body = (await request.json()) as {content?: string; topicId?: string}
    const result = appendMockMessage(params.chatId as string, {
      content: body.content ?? '',
      topicId: body.topicId,
    })
    if (result === 'invalid') {
      return HttpResponse.json({message: 'content is required'}, {status: 400})
    }
    if (result === 'missing') {
      return HttpResponse.json({message: 'Chat not found'}, {status: 404})
    }
    if (result === 'forbidden') {
      return HttpResponse.json({message: 'Not a chat member'}, {status: 403})
    }
    return HttpResponse.json(result, {status: 201})
  }),

  http.get('/mock-api/v1/messenger/chats/:chatId/messages', ({params, request}) => {
    const topicId = new URL(request.url).searchParams.get('topicId') ?? undefined
    const messages = getMockMessages(params.chatId as string, topicId)
    return HttpResponse.json(messages)
  }),

  http.get('/mock-api/v1/messenger/chats/:chatId/settings', ({params}) => {
    const settings = getMockChannelSettings(params.chatId as string)
    if (!settings) {
      return HttpResponse.json({message: 'Settings not found for this chat'}, {status: 404})
    }
    return HttpResponse.json(settings)
  }),

  http.patch('/mock-api/v1/messenger/chats/:chatId/settings', async ({params, request}) => {
    const body = (await request.json()) as ChannelSettingsPatch
    const next = patchMockChannelSettings(params.chatId as string, body)
    if (!next) {
      return HttpResponse.json({message: 'Settings not found for this chat'}, {status: 404})
    }
    return HttpResponse.json(next)
  }),

  /** @spec SPEC-FR-16.1.4 - Обработка действий в сообщениях */
  http.post('/mock-api/v1/messenger/actions/:actionId', ({params}) => {
    return HttpResponse.json({success: true, actionId: params.actionId})
  }),

  /** HOCFRONT-25 — accept/decline training appointment */
  http.post('/mock-api/v1/messenger/messages/:messageId/actions', async ({params, request}) => {
    const body = (await request.json()) as ResolveMessageActionPayload
    const result = resolveMockMessageAction(params.messageId as string, body)
    if (!result.success) {
      return HttpResponse.json(result, {status: 400})
    }
    return HttpResponse.json(result)
  }),
]
