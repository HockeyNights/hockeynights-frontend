import type {
  ChannelSettings,
  ChannelSettingsPatch,
  Chat,
  ChatTopic,
  ChatUser,
  CreateChatPayload,
  CreateChatTopicPayload,
  Message,
} from '@/entities/messenger'
import {mockPlayers} from '@/mocks/data/players'
import {mockUser} from '@/mocks/data/session'

/** @spec SPEC-FR-16.1.1, SPEC-FR-16.1.2 */
export const mockChats: Chat[] = [
  {
    id: 'chat-1',
    type: 'team',
    title: 'Медведи САО',
    avatarUrl: 'https://placehold.co/100x100/333/fff?text=M',
    unreadCount: 2,
    isPinned: true,
    isOnline: true,
    isTyping: true,
    memberIds: ['user-001', 'user-003', 'user-004'],
    relatedEntityId: 'team-001',
    tag: 'team',
    visibility: 'public',
  },
  {
    id: 'chat-2',
    type: 'event',
    title: 'Игра: Метеор vs Вымпел (06.06)',
    avatarUrl: 'https://placehold.co/100x100/0052cc/fff?text=G',
    unreadCount: 0,
    isOnline: false,
    memberIds: ['user-001', 'user-003'],
    relatedEntityId: 'event-001',
  },
  {
    id: 'chat-6',
    type: 'event',
    title: 'Открытый лёд · Ходынка',
    avatarUrl: 'https://placehold.co/100x100/1a5f7a/fff?text=Ice',
    unreadCount: 1,
    isOnline: false,
    memberIds: ['user-001', 'user-004'],
    relatedEntityId: 'event-003',
  },
  {
    id: 'chat-4',
    type: 'team',
    title: 'Соколы ЮАО',
    avatarUrl: 'https://placehold.co/100x100/0f7f95/fff?text=S',
    unreadCount: 3,
    isPinned: true,
    isOnline: true,
    memberIds: ['user-001', 'user-002', 'user-004'],
    relatedEntityId: 'team-002',
    tag: 'team',
    visibility: 'public',
  },
  {
    id: 'chat-7',
    type: 'team',
    title: 'Балтика',
    unreadCount: 0,
    isOnline: true,
    memberIds: ['user-004'],
    relatedEntityId: 'team-003',
    tag: 'team',
    visibility: 'public',
  },
  {
    id: 'chat-5',
    type: 'channel',
    title: 'Канал команды: Объявления',
    tag: 'announcements',
    unreadCount: 1,
    isOnline: true,
    isPinned: false,
    memberIds: ['user-001', 'user-003', 'user-004'],
    visibility: 'team_members',
    relatedEntityId: 'team-001',
  },
  {
    id: 'chat-3',
    type: 'system',
    title: 'Системные уведомления',
    unreadCount: 5,
    isOnline: true,
  },
]

export const mockChatUsers: ChatUser[] = [
  {userId: 'user-001', displayName: 'Петров Иван Сергеевич', position: 'forward', isOnline: true},
  {
    userId: 'user-arena-001',
    displayName: 'Администратор Ходынки',
    position: 'forward',
    isOnline: true,
  },
  ...mockPlayers.map((p) => ({
    userId: p.userId,
    displayName: p.displayName,
    position: p.position,
    isOnline: p.userId !== 'user-003',
  })),
]

export const mockMessages: Record<string, Message[]> = {
  'chat-1': [
    {
      id: 'msg-1',
      chatId: 'chat-1',
      senderId: 'user-1',
      senderName: 'Александр Овечкин',
      type: 'text',
      content: 'Парни, кто сегодня будет на тренировке?',
      topicId: 'topic-1',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'msg-2',
      chatId: 'chat-1',
      senderId: 'system',
      senderName: 'Система',
      type: 'actionable',
      content: 'Запрос на вступление в команду',
      topicId: 'topic-1',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      actionData: {
        type: 'join_team',
        title: 'Новый игрок: Иван Иванов',
        description: 'Амплуа: Защитник, Уровень: Amateur',
        status: 'pending',
        actions: [
          {id: 'act-1', label: 'Принять', action: 'approve', style: 'primary'},
          {id: 'act-2', label: 'Отклонить', action: 'decline', style: 'secondary'},
        ],
      },
    },
  ],
  'chat-2': [
    {
      id: 'msg-3',
      chatId: 'chat-2',
      senderId: 'system',
      senderName: 'Система',
      type: 'actionable',
      content: 'Бронирование льда',
      topicId: 'topic-3',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      actionData: {
        type: 'booking',
        title: 'Бронирование: Арена Мытищи',
        description: '06.06.2026, 20:00 - 21:30. Цена: 15 000 ₽',
        status: 'pending',
        actions: [{id: 'act-3', label: 'Оплатить долю', action: 'pay', style: 'primary'}],
      },
    },
  ],
  'chat-6': [
    {
      id: 'msg-open-ice-invite',
      chatId: 'chat-6',
      senderId: 'system',
      senderName: 'Система',
      type: 'actionable',
      content: 'Приглашение на открытый лёд',
      timestamp: new Date(Date.now() - 5400000).toISOString(),
      actionData: {
        type: 'booking',
        title: 'Открытый лёд · Ходынка',
        description: '28.05.2026, 21:00 · 60 мин. Подтвердите участие.',
        status: 'pending',
        actions: [
          {id: 'act-ice-1', label: 'Подтвердить', action: 'approve', style: 'primary'},
          {id: 'act-ice-2', label: 'Отклонить', action: 'decline', style: 'secondary'},
        ],
      },
    },
  ],
  'chat-3': [
    {
      id: 'msg-4',
      chatId: 'chat-3',
      senderId: 'system',
      senderName: 'Система',
      type: 'system',
      content: 'Ваша карма повышена за хорошую игру!',
      topicId: 'topic-5',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  'chat-5': [
    {
      id: 'msg-6',
      chatId: 'chat-5',
      topicId: 'topic-6',
      senderId: 'user-001',
      senderName: 'Петров Иван Сергеевич',
      type: 'text',
      content: 'Сбор команды в 19:40. Форма: белая.',
      timestamp: new Date(Date.now() - 1400000).toISOString(),
    },
  ],
}

mockMessages['chat-4'] = [
  {
    id: 'msg-5',
    chatId: 'chat-4',
    senderId: 'user-002',
    senderName: 'Смирнов Алексей Дмитриевич',
    type: 'text',
    content: 'Парни, собираемся в 19:40 у входа на арену.',
    topicId: 'topic-4',
    timestamp: new Date(Date.now() - 2400000).toISOString(),
  },
]

export const mockTopics: Record<string, ChatTopic[]> = {
  'chat-1': [
    {id: 'topic-1', chatId: 'chat-1', title: 'Общее', tag: 'general'},
    {
      id: 'topic-2',
      chatId: 'chat-1',
      title: 'Тактика и звенья',
      tag: 'tactics',
      restrictedUserIds: ['user-001', 'user-003'],
    },
  ],
  'chat-2': [{id: 'topic-3', chatId: 'chat-2', title: 'Игра 06.06', tag: 'event'}],
  'chat-4': [{id: 'topic-4', chatId: 'chat-4', title: 'Состав', tag: 'roster'}],
  'chat-6': [{id: 'topic-7', chatId: 'chat-6', title: 'Общее', tag: 'general'}],
  'chat-3': [{id: 'topic-5', chatId: 'chat-3', title: 'Система', tag: 'system'}],
  'chat-5': [{id: 'topic-6', chatId: 'chat-5', title: 'Объявления', tag: 'notice'}],
}

export const mockChannelSettings: Record<string, ChannelSettings> = {
  'chat-5': {
    chatId: 'chat-5',
    channelTag: 'announcements',
    currentUserRole: 'owner',
    notifications: {
      muted: false,
      mentionsOnly: false,
      pushEnabled: true,
    },
    permissions: {
      publishMinRole: 'captain',
      manageMembersMinRole: 'team_admin',
      allowTopicCreation: true,
    },
    slowModeSeconds: 30,
    audit: [
      {
        id: 'audit-1',
        actorName: 'Петров Иван Сергеевич',
        action: 'Создал канал и включил режим важных уведомлений',
        createdAt: new Date(Date.now() - 7_200_000).toISOString(),
      },
    ],
  },
}

// Update last messages in chats
mockChats.forEach((chat) => {
  const messages = mockMessages[chat.id]
  if (messages && messages.length > 0) {
    chat.lastMessage = messages[messages.length - 1]
  }
})

export function toggleMockChatPin(chatId: string, pinned?: boolean): Chat | null {
  const chat = mockChats.find((item) => item.id === chatId)
  if (!chat) return null
  chat.isPinned = pinned ?? !chat.isPinned
  return chat
}

export function getMockVisibleTopics(chatId: string, userId = 'user-001'): ChatTopic[] {
  return (mockTopics[chatId] ?? []).filter(
    (topic) => !topic.restrictedUserIds || topic.restrictedUserIds.includes(userId),
  )
}

export function createMockTopic(
  chatId: string,
  payload: CreateChatTopicPayload,
  userId = 'user-001',
): ChatTopic {
  const topic: ChatTopic = {
    id: `topic-${Date.now()}`,
    chatId,
    title: payload.title.trim(),
    tag: payload.tag?.trim() || undefined,
    restrictedUserIds:
      payload.restrictedUserIds && payload.restrictedUserIds.length > 0
        ? Array.from(new Set([userId, ...payload.restrictedUserIds]))
        : undefined,
  }
  mockTopics[chatId] = [topic, ...(mockTopics[chatId] ?? [])]
  return topic
}

export function createDirectMockChat(targetUserId: string): Chat | null {
  const target = mockChatUsers.find((user) => user.userId === targetUserId)
  if (!target) return null

  const existing = mockChats.find(
    (chat) => chat.type === 'direct' && chat.memberIds?.includes(targetUserId),
  )
  if (existing) return existing

  const chatId = `chat-${Date.now()}`
  const directChat: Chat = {
    id: chatId,
    type: 'direct',
    title: target.displayName,
    unreadCount: 0,
    isOnline: Boolean(target.isOnline),
    memberIds: [mockUser.id, targetUserId],
  }
  mockChats.unshift(directChat)
  const defaultTopicId = `topic-${Date.now()}`
  mockMessages[chatId] = [
    {
      id: `msg-${Date.now()}`,
      chatId,
      senderId: 'system',
      senderName: 'Система',
      type: 'system',
      content: `Чат с игроком ${target.displayName} создан.`,
      topicId: defaultTopicId,
      timestamp: new Date().toISOString(),
    },
  ]
  mockTopics[chatId] = [{id: defaultTopicId, chatId, title: 'Общее', tag: 'general'}]
  directChat.lastMessage = mockMessages[chatId][0]
  return directChat
}

export function createMockChannelOrChat(payload: CreateChatPayload, userId = 'user-001'): Chat {
  const chatId = `chat-${Date.now()}`
  const restricted = payload.restrictedUserIds && payload.restrictedUserIds.length > 0
  const chat: Chat = {
    id: chatId,
    type: payload.type,
    title: payload.title.trim(),
    tag: payload.tag?.trim() || undefined,
    unreadCount: 0,
    isOnline: true,
    memberIds: restricted
      ? Array.from(new Set([userId, ...payload.restrictedUserIds!]))
      : ['user-001', 'user-003', 'user-004'],
    visibility:
      payload.visibility ??
      (restricted ? 'restricted' : payload.type === 'team' ? 'public' : 'team_members'),
    relatedEntityId: payload.relatedEntityId,
  }
  mockChats.unshift(chat)
  const defaultTopic = createMockTopic(
    chatId,
    {title: 'Общее', tag: 'general', restrictedUserIds: payload.restrictedUserIds},
    userId,
  )
  const firstMessage: Message = {
    id: `msg-${Date.now()}`,
    chatId,
    topicId: defaultTopic.id,
    senderId: 'system',
    senderName: 'Система',
    type: 'system',
    content:
      payload.type === 'team' && chat.visibility === 'public'
        ? `Публичный чат команды «${chat.title}» создан. Его можно найти в поиске мессенджера.`
        : `${payload.type === 'channel' ? 'Канал' : 'Чат'} «${chat.title}» создан.`,
    timestamp: new Date().toISOString(),
  }
  mockMessages[chatId] = [firstMessage]
  chat.lastMessage = firstMessage
  if (chat.type === 'channel') {
    mockChannelSettings[chatId] = {
      chatId,
      channelTag: chat.tag,
      currentUserRole: 'owner',
      notifications: {
        muted: false,
        mentionsOnly: false,
        pushEnabled: true,
      },
      permissions: {
        publishMinRole: 'captain',
        manageMembersMinRole: 'team_admin',
        allowTopicCreation: true,
      },
      slowModeSeconds: 0,
      audit: [
        {
          id: `audit-${Date.now()}`,
          actorName: 'Петров Иван Сергеевич',
          action: 'создал канал',
          createdAt: new Date().toISOString(),
        },
      ],
    }
  }
  return chat
}

/** Публичные командные чаты для поиска в мессенджере */
export function searchMockDiscoverableChats(query: string): Chat[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return []
  return mockChats.filter((chat) => {
    if (chat.type !== 'team' || chat.visibility !== 'public') return false
    return (
      chat.title.toLowerCase().includes(needle) ||
      chat.tag?.toLowerCase().includes(needle) ||
      chat.relatedEntityId?.toLowerCase().includes(needle)
    )
  })
}

/** Открыть публичный чат: добавить текущего пользователя в участники */
export function openMockDiscoverableChat(chatId: string, userId = 'user-001'): Chat | null {
  const chat = mockChats.find((item) => item.id === chatId)
  if (!chat || chat.visibility !== 'public') return null
  if (!chat.memberIds?.includes(userId)) {
    chat.memberIds = [...(chat.memberIds ?? []), userId]
  }
  return chat
}

export function appendMockMessage(
  chatId: string,
  input: {content: string; topicId?: string},
  user: {id: string; displayName: string} = mockUser,
): Message | 'missing' | 'forbidden' | 'invalid' {
  const content = input.content.trim()
  if (!content) return 'invalid'
  const chat = mockChats.find((item) => item.id === chatId)
  if (!chat) return 'missing'
  if (chat.memberIds && !chat.memberIds.includes(user.id)) return 'forbidden'

  const message: Message = {
    id: `msg-${Date.now()}`,
    chatId,
    topicId: input.topicId,
    senderId: user.id,
    senderName: user.displayName,
    type: 'text',
    content,
    timestamp: new Date().toISOString(),
  }
  mockMessages[chatId] = [...(mockMessages[chatId] ?? []), message]
  chat.lastMessage = message
  return message
}

export function getMockMessages(chatId: string, topicId?: string, userId = 'user-001'): Message[] {
  const visibleTopicIds = new Set(getMockVisibleTopics(chatId, userId).map((topic) => topic.id))
  const messages = (mockMessages[chatId] ?? []).filter(
    (message) => !message.topicId || visibleTopicIds.has(message.topicId),
  )
  if (!topicId) return messages
  return messages.filter((message) => message.topicId === topicId)
}

export function getMockChannelSettings(chatId: string): ChannelSettings | null {
  return mockChannelSettings[chatId] ?? null
}

export function patchMockChannelSettings(
  chatId: string,
  patch: ChannelSettingsPatch,
  actorName = 'Петров Иван Сергеевич',
): ChannelSettings | null {
  const current = mockChannelSettings[chatId]
  if (!current) return null
  const next: ChannelSettings = {
    ...current,
    ...patch,
    notifications: {...current.notifications, ...(patch.notifications ?? {})},
    permissions: {...current.permissions, ...(patch.permissions ?? {})},
    audit: current.audit,
  }
  const actionParts: string[] = []
  if (patch.notifications) actionParts.push('обновлены уведомления')
  if (patch.permissions) actionParts.push('обновлены права')
  if (patch.slowModeSeconds !== undefined) actionParts.push(`slow mode: ${patch.slowModeSeconds}с`)
  if (patch.channelTag !== undefined) actionParts.push(`тег: ${patch.channelTag || 'без тега'}`)
  const entry = {
    id: `audit-${Date.now()}`,
    actorName,
    action: actionParts.length ? actionParts.join(', ') : 'обновлены настройки канала',
    createdAt: new Date().toISOString(),
  }
  next.audit = [entry, ...current.audit].slice(0, 10)
  mockChannelSettings[chatId] = next
  const chat = mockChats.find((item) => item.id === chatId)
  if (chat) {
    chat.tag = next.channelTag || chat.tag
  }
  return next
}
