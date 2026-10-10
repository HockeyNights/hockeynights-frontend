/**
 * SPEC-FR-16.1.1, SPEC-UI-8.3 — список чатов с локальным поиском.
 */

import {Magnifier} from '@gravity-ui/icons'
import {Icon, TextInput} from '@gravity-ui/uikit'

import type {Chat} from '@/entities/messenger'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {IceCard} from '@/shared/ui/IceCard'

import {MessengerChatRow} from './MessengerChatRow'

interface MessengerChatListProps {
  chats: Chat[]
  activeChatId: string | null
  query: string
  onQueryChange: (value: string) => void
  onSelect: (chatId: string) => void
  onTogglePin: (chatId: string) => void
  /** Кнопка «Новый чат» в пустом состоянии. */
  emptyAction?: React.ReactNode
  /** `false` — поле поиска рендерит страница (в шапке), список только показывает чаты. */
  withSearch?: boolean
}

export function MessengerChatList({
  chats,
  activeChatId,
  query,
  onQueryChange,
  onSelect,
  onTogglePin,
  emptyAction,
  withSearch = true,
}: MessengerChatListProps) {
  return (
    <IceCard
      padding="s"
      className={`messenger-hub__sidebar${withSearch ? '' : ' messenger-hub__sidebar--bare'}`}
      data-testid={testId('messenger', 'page', 'nav', 'sidebar')}
    >
      {withSearch && (
        <TextInput
          size="m"
          value={query}
          hasClear
          onUpdate={onQueryChange}
          placeholder="Поиск по чатам"
          startContent={
            <span className="messenger-hub__search-icon" aria-hidden>
              <Icon data={Magnifier} size={16} />
            </span>
          }
          aria-label="Поиск по чатам"
          data-testid={testId('messenger', 'page', 'field', 'chat-search')}
        />
      )}
      <div className="chat-list" data-testid={testId('messenger', 'page', 'list', 'chats')}>
        {chats.length === 0 ? (
          <div data-testid={testId('messenger', 'page', 'empty', 'chats')}>
            <EmptyNetState
              title={query.trim() ? 'Ничего не найдено' : 'Чатов пока нет'}
              copy={
                query.trim()
                  ? 'Попробуй изменить запрос или начни новый чат.'
                  : 'Начни диалог с игроком или создай канал команды.'
              }
              testIdPrefix="messenger"
              action={emptyAction}
            />
          </div>
        ) : (
          chats.map((chat) => (
            <MessengerChatRow
              key={chat.id}
              chat={chat}
              isActive={activeChatId === chat.id}
              onSelect={onSelect}
              onTogglePin={onTogglePin}
            />
          ))
        )}
      </div>
    </IceCard>
  )
}
