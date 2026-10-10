/**
 * SPEC-FR-16.1.2, SPEC-FR-22.1.1
 * SPEC-UI-8.1, SPEC-UI-8.4, SPEC-UI-8.5 — активный диалог: шапка, темы, лента, композер.
 */

import {ArrowLeft, Gear, Paperclip, PaperPlane, Pin, PinFill, Plus} from '@gravity-ui/icons'
import {Icon, Text, TextArea} from '@gravity-ui/uikit'
import {useEffect, useId, useRef, useState} from 'react'

import type {Chat, ChatTopic, Message} from '@/entities/messenger'
import {getChatInitial} from '@/entities/messenger'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

import {ChatBubble} from './ChatBubble'

interface MessengerConversationProps {
  chat: Chat
  topics: ChatTopic[]
  activeTopicId: string | null
  onSelectTopic: (topicId: string) => void
  messages: Message[]
  isLoadingMessages: boolean
  isMessagesError: boolean
  onRetryMessages: () => void
  onSendMessage: (text: string) => void
  onTogglePin: () => void
  isPinPending: boolean
  onOpenTopicComposer: () => void
  canOpenChannelSettings: boolean
  onOpenChannelSettings: () => void
  /** Мобильная кнопка «назад к списку»; на десктопе не рендерится. */
  onBack?: () => void
  statusMessage?: string | null
}

export function MessengerConversation({
  chat,
  topics,
  activeTopicId,
  onSelectTopic,
  messages,
  isLoadingMessages,
  isMessagesError,
  onRetryMessages,
  onSendMessage,
  onTogglePin,
  isPinPending,
  onOpenTopicComposer,
  canOpenChannelSettings,
  onOpenChannelSettings,
  onBack,
  statusMessage,
}: MessengerConversationProps) {
  const [inputText, setInputText] = useState('')
  const feedRef = useRef<HTMLDivElement>(null)
  const feedId = useId()

  /** Новая лента и новые сообщения прокручиваются к последнему. */
  useEffect(() => {
    const feed = feedRef.current
    if (feed) feed.scrollTop = feed.scrollHeight
  }, [messages, chat.id, activeTopicId])

  function handleSend() {
    const text = inputText.trim()
    if (!text) return
    onSendMessage(text)
    setInputText('')
  }

  return (
    <IceCard
      padding="s"
      className="messenger-hub__conversation"
      data-testid={testId('messenger', 'page', 'panel', 'main')}
    >
      <div
        className="messenger-header"
        data-testid={testId('messenger', 'page', 'panel', 'header')}
      >
        {onBack && (
          <button
            type="button"
            className="messenger-back"
            onClick={onBack}
            aria-label="Назад к списку чатов"
            data-testid={testId('messenger', 'page', 'btn', 'back')}
          >
            <Icon data={ArrowLeft} size={18} />
          </button>
        )}
        <span className="messenger-header__avatar" aria-hidden>
          {getChatInitial(chat)}
        </span>
        <div
          className="messenger-header__title"
          data-testid={testId('messenger', 'page', 'panel', 'header-title')}
        >
          <Text
            variant="subheader-2"
            ellipsis
            data-testid={testId('messenger', 'page', 'text', 'active-chat-title')}
          >
            {chat.title}
          </Text>
          {chat.isTyping ? (
            <Text
              variant="caption-1"
              className="messenger-header__typing"
              data-testid={testId('messenger', 'page', 'text', 'typing')}
            >
              печатает...
            </Text>
          ) : (
            chat.isOnline && (
              <Text
                variant="caption-1"
                color="secondary"
                data-testid={testId('messenger', 'page', 'text', 'online')}
              >
                в сети
              </Text>
            )
          )}
        </div>
        <div
          className="messenger-header__actions"
          data-testid={testId('messenger', 'page', 'nav', 'header-actions')}
        >
          <HockeyButton
            size="m"
            view={chat.isPinned ? 'action' : 'outlined'}
            className="messenger-header__pin"
            onClick={onTogglePin}
            loading={isPinPending}
            aria-label={chat.isPinned ? 'Открепить чат' : 'Закрепить чат'}
            title={chat.isPinned ? 'Открепить' : 'Закрепить'}
            data-testid={testId('messenger', 'page', 'btn', 'toggle-pin', chat.id)}
          >
            <Icon data={chat.isPinned ? PinFill : Pin} size={16} />
          </HockeyButton>
          <HockeyButton
            size="m"
            view="outlined"
            onClick={onOpenTopicComposer}
            className="messenger-header__topic-btn"
            data-testid={testId('messenger', 'page', 'btn', 'new-topic', chat.id)}
          >
            <Icon data={Plus} size={16} />
            <span className="messenger-header__btn-label">Тема</span>
          </HockeyButton>
          {canOpenChannelSettings && (
            <HockeyButton
              size="m"
              view="outlined"
              onClick={onOpenChannelSettings}
              aria-label="Настройки канала"
              title="Настройки канала"
              data-testid={testId('messenger', 'page', 'btn', 'channel-settings', chat.id)}
            >
              <Icon data={Gear} size={16} />
            </HockeyButton>
          )}
        </div>
      </div>

      {topics.length > 0 && (
        <div
          className="messenger-topics"
          role="tablist"
          aria-label="Темы чата"
          data-testid={testId('messenger', 'page', 'nav', 'topics')}
        >
          {topics.map((topic) => {
            const isActive = activeTopicId === topic.id
            return (
              <button
                key={topic.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={feedId}
                className={`messenger-topics__item ${isActive ? 'is-active' : ''}`}
                onClick={() => onSelectTopic(topic.id)}
                data-testid={testId('messenger', 'page', 'tab', 'topic', topic.id)}
              >
                <span data-testid={testId('messenger', 'page', 'text', 'topic-title', topic.id)}>
                  {topic.title}
                </span>
                {topic.tag && (
                  <small data-testid={testId('messenger', 'page', 'badge', 'topic-tag', topic.id)}>
                    #{topic.tag}
                  </small>
                )}
                {topic.restrictedUserIds && topic.restrictedUserIds.length > 0 && (
                  <span
                    className="messenger-topics__lock"
                    title="Тема с ограниченным доступом"
                    data-testid={testId('messenger', 'page', 'badge', 'topic-locked', topic.id)}
                  >
                    <span className="hockey-sr-only">Ограниченный доступ</span>
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      <div
        ref={feedRef}
        id={feedId}
        role={topics.length > 0 ? 'tabpanel' : undefined}
        className="messenger-messages"
        data-testid={testId('messenger', 'page', 'feed', 'messages')}
      >
        {isLoadingMessages && messages.length === 0 ? (
          <div data-testid={testId('messenger', 'page', 'loader', 'messages')}>
            <ScoreboardLoader label="Загрузка сообщений" testIdPrefix="messenger" />
          </div>
        ) : isMessagesError && messages.length === 0 ? (
          <div data-testid={testId('messenger', 'page', 'error', 'messages')}>
            <EmptyNetState
              title="Не удалось загрузить сообщения"
              copy="Проверь соединение и попробуй ещё раз."
              testIdPrefix="messenger"
              action={
                <HockeyButton
                  view="outlined"
                  size="s"
                  onClick={onRetryMessages}
                  data-testid={testId('messenger', 'page', 'btn', 'retry-messages')}
                >
                  Повторить
                </HockeyButton>
              }
            />
          </div>
        ) : messages.length === 0 ? (
          <div data-testid={testId('messenger', 'page', 'empty', 'messages')}>
            <EmptyNetState
              title="Сообщений пока нет"
              copy="Напиши первым — лента появится здесь."
              testIdPrefix="messenger"
            />
          </div>
        ) : (
          messages.map((msg, i) => (
            <ChatBubble key={msg.id} message={msg} isOwn={msg.senderId === 'me'} index={i} />
          ))
        )}
      </div>

      {statusMessage && (
        <div
          className="messenger-status"
          role="status"
          data-testid={testId('messenger', 'page', 'panel', 'status')}
        >
          <Text
            variant="caption-1"
            color="secondary"
            data-testid={testId('messenger', 'page', 'text', 'status')}
          >
            {statusMessage}
          </Text>
        </div>
      )}

      <div className="messenger-input" data-testid={testId('messenger', 'page', 'panel', 'input')}>
        <HockeyButton
          size="m"
          view="outlined"
          disabled
          aria-label="Вложение — скоро"
          title="Вложения появятся позже"
          className="messenger-input__side-btn"
          data-testid={testId('messenger', 'page', 'btn', 'attach')}
        >
          <Icon data={Paperclip} size={16} />
        </HockeyButton>
        <TextArea
          size="m"
          value={inputText}
          onUpdate={setInputText}
          placeholder="Напишите сообщение..."
          aria-label="Текст сообщения"
          minRows={1}
          maxRows={6}
          /* Enter отправляет, Shift+Enter переносит строку — как в мессенджерах. */
          onKeyDown={(e) => {
            if (e.key !== 'Enter' || e.shiftKey) return
            /* IME: пока идёт композиция иероглифов, Enter подтверждает ввод. */
            if (e.nativeEvent.isComposing) return
            e.preventDefault()
            handleSend()
          }}
          qa={testId('messenger', 'page', 'field', 'message-input')}
        />
        <HockeyButton
          size="m"
          view="outlined"
          className="messenger-input__side-btn messenger-input__send"
          disabled={!inputText.trim()}
          onClick={handleSend}
          aria-label="Отправить сообщение"
          data-testid={testId('messenger', 'page', 'btn', 'send')}
        >
          <Icon data={PaperPlane} size={16} />
        </HockeyButton>
      </div>
    </IceCard>
  )
}
