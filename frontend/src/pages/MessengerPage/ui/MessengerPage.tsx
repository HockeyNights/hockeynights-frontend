/**
 * SPEC-FR-16.1.1, SPEC-FR-22.1.1, SPEC-FR-22.1.2, SPEC-FR-22.1.3
 * SPEC-UI-8.1, SPEC-UI-8.5
 * HOCFRONT-42 — экран собран по компонентам профиля: PageHeader → табы → две ледовые карточки.
 */

import {Plus} from '@gravity-ui/icons'
import {Icon} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useEffect, useMemo, useState} from 'react'
import {useSearchParams} from 'react-router'

import type {Chat, ChatFilterMode, ChatTopic, Message} from '@/entities/messenger'
import {
  fetchChatMessagesByTopic,
  fetchChats,
  fetchChatTopics,
  selectChats,
  sendChatMessage,
  toggleChatPin,
} from '@/entities/messenger'
import {
  MessengerChannelSettingsDialog,
  MessengerChatList,
  MessengerConversation,
  MessengerNewChannelDialog,
  MessengerNewChatDialog,
  MessengerNewTopicDialog,
} from '@/features/messenger'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {PageHeader} from '@/shared/ui/PageHeader'
import {QueryState} from '@/shared/ui/QueryState'

const MOBILE_BREAKPOINT = '(max-width: 768px)'

function isMobileViewport(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(MOBILE_BREAKPOINT).matches
}

const FILTER_TABS: Array<{value: ChatFilterMode; label: string}> = [
  {value: 'all', label: 'Все'},
  {value: 'pinned', label: 'Закреплённые'},
  {value: 'channels', label: 'Каналы'},
]

type MessengerDialog = 'none' | 'new-chat' | 'new-channel' | 'new-topic' | 'channel-settings'

export function MessengerPage() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const chatIdFromUrl = searchParams.get('chatId')

  const {
    data: chats = [],
    isLoading: isLoadingChats,
    isError: isChatsError,
    refetch: refetchChats,
  } = useQuery({
    queryKey: ['messenger-chats'],
    queryFn: fetchChats,
  })

  const [selectedChatId, setSelectedChatId] = useState<string | null>(chatIdFromUrl)
  const [syncedChatIdFromUrl, setSyncedChatIdFromUrl] = useState(chatIdFromUrl)
  const [isMobile, setIsMobile] = useState(isMobileViewport)
  const [mobileView, setMobileView] = useState<'list' | 'chat'>(chatIdFromUrl ? 'chat' : 'list')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMode, setFilterMode] = useState<ChatFilterMode>('all')
  const [dialog, setDialog] = useState<MessengerDialog>('none')
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  if (chatIdFromUrl !== syncedChatIdFromUrl) {
    setSyncedChatIdFromUrl(chatIdFromUrl)
    if (chatIdFromUrl) {
      setSelectedChatId(chatIdFromUrl)
      setMobileView('chat')
    }
  }

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_BREAKPOINT)
    const update = () => {
      const mobile = mq.matches
      setIsMobile((prev) => {
        if (!prev && mobile) setMobileView('list')
        return mobile
      })
    }
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  function clearChatIdFromUrl() {
    if (!searchParams.has('chatId')) return
    const next = new URLSearchParams(searchParams)
    next.delete('chatId')
    setSearchParams(next, {replace: true})
  }

  const pinChatMutation = useMutation({
    mutationFn: ({chatId, pinned}: {chatId: string; pinned?: boolean}) =>
      toggleChatPin(chatId, pinned),
    onSuccess: (chat) => {
      queryClient.setQueryData<Chat[]>(['messenger-chats'], (prev = []) =>
        prev.map((item) => (item.id === chat.id ? chat : item)),
      )
    },
  })

  const visibleChats = useMemo(
    () => selectChats(chats, filterMode, searchQuery),
    [chats, filterMode, searchQuery],
  )

  const activeChatId =
    selectedChatId ??
    chatIdFromUrl ??
    (!isMobile && visibleChats[0]?.id ? visibleChats[0].id : null)
  /** Deep-link держит chat-view, пока пользователь не сменил чат / не нажал «назад». */
  const activeMobileView: 'list' | 'chat' = chatIdFromUrl && !selectedChatId ? 'chat' : mobileView
  const selectedChat = chats.find((chat) => chat.id === activeChatId) ?? null
  const isChannelChat = selectedChat?.type === 'channel'

  const {data: topics = []} = useQuery({
    queryKey: ['messenger-topics', activeChatId],
    queryFn: () => fetchChatTopics(activeChatId!),
    enabled: Boolean(activeChatId),
  })

  const activeTopicId =
    selectedTopicId && topics.some((topic: ChatTopic) => topic.id === selectedTopicId)
      ? selectedTopicId
      : (topics[0]?.id ?? null)

  const {
    data: messages = [],
    isLoading: isLoadingMessages,
    isError: isMessagesError,
    refetch: refetchMessages,
  } = useQuery({
    queryKey: ['messenger-messages', activeChatId, activeTopicId],
    queryFn: () => fetchChatMessagesByTopic(activeChatId!, activeTopicId ?? undefined),
    enabled: Boolean(activeChatId),
  })

  function openChat(chatId: string) {
    clearChatIdFromUrl()
    setSelectedChatId(chatId)
    setSelectedTopicId(null)
    if (isMobileViewport()) setMobileView('chat')
  }

  function handleMobileBack() {
    clearChatIdFromUrl()
    setSelectedChatId(null)
    setMobileView('list')
  }

  const sendMessageMutation = useMutation({
    mutationFn: (text: string) =>
      sendChatMessage(activeChatId!, {
        content: text,
        topicId: activeTopicId ?? undefined,
      }),
    onSuccess: (message) => {
      queryClient.setQueryData<Message[]>(
        ['messenger-messages', activeChatId, activeTopicId],
        (prev = []) => [...prev, message],
      )
      void queryClient.invalidateQueries({queryKey: ['messenger-chats']})
      setStatusMessage(null)
    },
    onError: () => {
      setStatusMessage('Не удалось отправить сообщение')
    },
  })

  function handleSendMessage(text: string) {
    if (!activeChatId || sendMessageMutation.isPending) return
    sendMessageMutation.mutate(text)
  }

  const unreadTotal = chats.reduce((total, chat) => total + Math.max(0, chat.unreadCount), 0)
  const hubClass = [
    'messenger-hub',
    isMobile ? 'messenger-hub--mobile' : '',
    isMobile && activeMobileView === 'chat' ? 'messenger-hub--mobile-chat' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const newChatButton = (
    <HockeyButton
      view="action"
      onClick={() => setDialog('new-chat')}
      data-testid={testId('messenger', 'page', 'btn', 'new-chat')}
    >
      <Icon data={Plus} size={16} />
      Новый чат
    </HockeyButton>
  )

  if (isLoadingChats || isChatsError) {
    return (
      <div className={hubClass} data-testid={testId('messenger', 'page', 'page')}>
        <QueryState
          isLoading={isLoadingChats}
          isError={isChatsError}
          loadingLabel="Загрузка чатов"
          errorTitle="Не удалось загрузить чаты"
          errorCopy="Проверь соединение и попробуй ещё раз."
          onRetry={() => void refetchChats()}
          testIdPrefix="messenger"
        />
      </div>
    )
  }

  return (
    <div className={hubClass} data-testid={testId('messenger', 'page', 'page')}>
      <PageHeader
        title="Мессенджер"
        subtitle={
          unreadTotal > 0
            ? `${chats.length} диалогов · ${unreadTotal} непрочитанных`
            : `${chats.length} диалогов`
        }
        testIdPrefix="messenger"
        actions={
          <div
            className="messenger-hub__actions"
            data-testid={testId('messenger', 'page', 'nav', 'actions')}
          >
            {newChatButton}
            <HockeyButton
              view="outlined"
              onClick={() => setDialog('new-channel')}
              data-testid={testId('messenger', 'page', 'btn', 'new-channel')}
            >
              Новый канал
            </HockeyButton>
          </div>
        }
      />

      <div
        className="messenger-hub__toolbar"
        data-testid={testId('messenger', 'page', 'nav', 'toolbar')}
      >
        <div
          className="messenger-hub__tabs"
          role="group"
          aria-label="Фильтр чатов"
          data-testid={testId('messenger', 'page', 'tab', 'list')}
        >
          {FILTER_TABS.map((tab) => (
            <HockeyButton
              key={tab.value}
              view={filterMode === tab.value ? 'action' : 'outlined'}
              aria-pressed={filterMode === tab.value}
              onClick={() => setFilterMode(tab.value)}
              data-testid={testId('messenger', 'page', 'btn', `filter-${tab.value}`)}
            >
              {tab.label}
            </HockeyButton>
          ))}
        </div>
      </div>

      <div
        className="messenger-hub__grid"
        data-testid={testId('messenger', 'page', 'panel', 'grid')}
      >
        <MessengerChatList
          chats={visibleChats}
          activeChatId={activeChatId}
          query={searchQuery}
          onQueryChange={setSearchQuery}
          onSelect={openChat}
          onTogglePin={(chatId) => pinChatMutation.mutate({chatId})}
          emptyAction={newChatButton}
        />

        {selectedChat ? (
          <MessengerConversation
            key={selectedChat.id}
            chat={selectedChat}
            topics={topics}
            activeTopicId={activeTopicId}
            onSelectTopic={setSelectedTopicId}
            messages={messages}
            isLoadingMessages={isLoadingMessages}
            isMessagesError={isMessagesError}
            onRetryMessages={() => void refetchMessages()}
            onSendMessage={handleSendMessage}
            onTogglePin={() => pinChatMutation.mutate({chatId: selectedChat.id})}
            isPinPending={pinChatMutation.isPending}
            onOpenTopicComposer={() => setDialog('new-topic')}
            canOpenChannelSettings={isChannelChat}
            onOpenChannelSettings={() => setDialog('channel-settings')}
            onBack={isMobile ? handleMobileBack : undefined}
            statusMessage={statusMessage}
          />
        ) : (
          <IceCard
            padding="l"
            className="messenger-hub__conversation messenger-hub__conversation--empty"
            data-testid={testId('messenger', 'page', 'empty', 'no-chat')}
          >
            <EmptyNetState
              title="Выберите чат"
              copy="Слева — диалоги и каналы. Или начните новый чат."
              testIdPrefix="messenger"
              action={newChatButton}
            />
          </IceCard>
        )}
      </div>

      <MessengerNewChatDialog
        open={dialog === 'new-chat'}
        onClose={() => setDialog('none')}
        onChatReady={(chat, message) => {
          setDialog('none')
          setStatusMessage(message ?? null)
          openChat(chat.id)
        }}
      />

      <MessengerNewChannelDialog
        open={dialog === 'new-channel'}
        onClose={() => setDialog('none')}
        onCreated={(chat, message) => {
          setDialog('none')
          setStatusMessage(message)
          openChat(chat.id)
        }}
      />

      {selectedChat && (
        <MessengerNewTopicDialog
          open={dialog === 'new-topic'}
          onClose={() => setDialog('none')}
          chat={selectedChat}
          onCreated={(topic, message) => {
            setDialog('none')
            setStatusMessage(message)
            setSelectedTopicId(topic.id)
          }}
        />
      )}

      {selectedChat && isChannelChat && (
        <MessengerChannelSettingsDialog
          open={dialog === 'channel-settings'}
          onClose={() => setDialog('none')}
          chat={selectedChat}
          onStatus={setStatusMessage}
        />
      )}
    </div>
  )
}
