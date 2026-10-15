/**
 * EPIC-08 / ICE — inbox заявок на лёд в кабинете организатора
 */

import {Text} from '@gravity-ui/uikit'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import {useMemo, useState} from 'react'
import {Link, useNavigate} from 'react-router'

import type {IceAgreement} from '@/entities/event'
import {ICE_AGREEMENT_POOL_LABELS} from '@/entities/event'
import {fetchMyIceAgreements, updateIceBooking} from '@/entities/external-flow'
import {createDirectChat} from '@/entities/messenger'
import {
  ICE_BOOKING_BUCKET_LABELS,
  iceBookingBucket,
  type IceBookingInboxBucket,
  ORGANIZER_ICE_BOOKING_STATUS_LABELS,
} from '@/features/arenas/lib/iceBookingStatus'
import {
  agreementCreatePath,
  formatAgreementInterval,
  isAgreementReadyForTraining,
} from '@/features/events/lib/iceAgreements'
import {arenaDetailsPath, routes} from '@/shared/const/appRoutes'
import {testId} from '@/shared/testing/testId'
import {EmptyNetState} from '@/shared/ui/EmptyNetState'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'

type BucketFilter = 'all' | IceBookingInboxBucket

const BUCKET_FILTERS: BucketFilter[] = ['all', 'inbox', 'work', 'payment', 'done', 'archive']

function formatBrief(agreement: IceAgreement): string {
  const when = agreement.slotLabel || formatAgreementInterval(agreement.startsAt, agreement.endsAt)
  const price =
    agreement.priceRub != null ? ` · ${agreement.priceRub.toLocaleString('ru-RU')} ₽` : ''
  return `${when}${price}`
}

export function OrganizerAgreementsPanel() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [bucket, setBucket] = useState<BucketFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const {data: agreements = [], isLoading} = useQuery({
    queryKey: ['my-ice-agreements'],
    queryFn: fetchMyIceAgreements,
  })

  const counts = useMemo(() => {
    const next: Record<IceBookingInboxBucket, number> = {
      inbox: 0,
      work: 0,
      payment: 0,
      done: 0,
      archive: 0,
    }
    for (const item of agreements) next[iceBookingBucket(item.bookingStatus)] += 1
    return next
  }, [agreements])

  const filtered = useMemo(() => {
    if (bucket === 'all') return agreements
    return agreements.filter((item) => iceBookingBucket(item.bookingStatus) === bucket)
  }, [agreements, bucket])

  const selected =
    filtered.find((item) => item.id === selectedId) ??
    agreements.find((item) => item.id === selectedId) ??
    filtered[0] ??
    null

  const chatMutation = useMutation({
    mutationFn: async (agreement: IceAgreement) => {
      if (agreement.chatId) return {chatId: agreement.chatId}
      const targetUserId = agreement.arenaContactUserId
      if (!targetUserId) throw new Error('Нет контакта арены для чата')
      const chat = await createDirectChat(targetUserId)
      await updateIceBooking(agreement.bookingId, {chatId: chat.id})
      return {chatId: chat.id}
    },
    onSuccess: ({chatId}) => {
      void queryClient.invalidateQueries({queryKey: ['my-ice-agreements']})
      void queryClient.invalidateQueries({queryKey: ['messenger-chats']})
      navigate(`${routes.messenger}?chatId=${chatId}`)
    },
  })

  if (isLoading) {
    return (
      <div data-testid={testId('events', 'agreements', 'loader')}>
        <ScoreboardLoader label="Загрузка заявок…" />
      </div>
    )
  }

  return (
    <div
      className="hockey-stack hockey-stack--gap-16"
      data-testid={testId('events', 'agreements', 'panel')}
    >
      <div className="hockey-row hockey-row--between hockey-row--align-center hockey-row--wrap">
        <div className="hockey-stack hockey-stack--gap-4">
          <Text variant="subheader-2" data-testid={testId('events', 'agreements', 'text', 'title')}>
            Заявки на лёд
          </Text>
          <Text color="secondary" data-testid={testId('events', 'agreements', 'text', 'hint')}>
            Статусы от черновика до подтверждённой брони. Краткая инфа, телефон арены и чат — в
            карточке заявки.
          </Text>
        </div>
        <Text color="secondary" data-testid={testId('events', 'agreements', 'text', 'stats')}>
          Новые {counts.inbox} · в работе {counts.work} · оплата {counts.payment} · готовы{' '}
          {counts.done}
        </Text>
      </div>

      <div
        className="hockey-segmented org-cab__filters"
        role="tablist"
        aria-label="Фильтр заявок на лёд"
        data-testid={testId('events', 'agreements', 'panel', 'filters')}
      >
        {BUCKET_FILTERS.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={bucket === key}
            className={`hockey-segmented__item${bucket === key ? ' is-active' : ''}`}
            onClick={() => setBucket(key)}
            data-testid={testId('events', 'agreements', 'btn', 'filter', key)}
          >
            {key === 'all'
              ? `Все (${agreements.length})`
              : `${ICE_BOOKING_BUCKET_LABELS[key]} (${counts[key]})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyNetState
          title="Нет заявок"
          copy="Запросите лёд на странице арены — заявка появится здесь со статусом и чатом."
          testIdPrefix="events"
          data-testid={testId('events', 'agreements', 'empty')}
        />
      ) : (
        <div
          className="arena-partner-bookings__layout"
          data-testid={testId('events', 'agreements', 'list')}
        >
          <div className="hockey-stack hockey-stack--gap-8">
            {filtered.map((agreement) => {
              const isActive = selected?.id === agreement.id
              return (
                <button
                  key={agreement.id}
                  type="button"
                  className={`arena-partner-booking-row${isActive ? ' is-active' : ''}`}
                  onClick={() => setSelectedId(agreement.id)}
                  data-testid={testId('events', 'agreements', 'row', agreement.id)}
                >
                  <div className="hockey-row hockey-row--between hockey-row--align-start hockey-row--wrap">
                    <div className="hockey-stack hockey-stack--gap-4">
                      <Text
                        data-testid={testId('events', 'agreements', 'text', 'arena', agreement.id)}
                      >
                        {agreement.arenaName}
                      </Text>
                      <Text
                        color="secondary"
                        data-testid={testId(
                          'events',
                          'agreements',
                          'text',
                          'interval',
                          agreement.id,
                        )}
                      >
                        {formatBrief(agreement)}
                      </Text>
                      <Text
                        color="secondary"
                        data-testid={testId('events', 'agreements', 'text', 'status', agreement.id)}
                      >
                        {ORGANIZER_ICE_BOOKING_STATUS_LABELS[agreement.bookingStatus]}
                        {agreement.purpose ? ` · ${agreement.purpose}` : ''}
                      </Text>
                    </div>
                    <span
                      className={`arena-partner-status arena-partner-status--${iceBookingBucket(agreement.bookingStatus)}`}
                    >
                      {ICE_AGREEMENT_POOL_LABELS[agreement.poolStatus]}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {selected ? (
            <IceCard
              padding="m"
              data-testid={testId('events', 'agreements', 'panel', 'detail', selected.id)}
            >
              <div className="hockey-stack hockey-stack--gap-12">
                <div className="hockey-row hockey-row--between hockey-row--align-start hockey-row--wrap">
                  <div className="hockey-stack hockey-stack--gap-4">
                    <Text
                      variant="subheader-2"
                      data-testid={testId(
                        'events',
                        'agreements',
                        'text',
                        'detail-title',
                        selected.id,
                      )}
                    >
                      {selected.arenaName}
                    </Text>
                    <Text
                      color="secondary"
                      data-testid={testId(
                        'events',
                        'agreements',
                        'text',
                        'detail-pool',
                        selected.id,
                      )}
                    >
                      {ICE_AGREEMENT_POOL_LABELS[selected.poolStatus]}
                    </Text>
                  </div>
                  <span
                    className={`arena-partner-status arena-partner-status--${iceBookingBucket(selected.bookingStatus)}`}
                    data-testid={testId(
                      'events',
                      'agreements',
                      'text',
                      'detail-status',
                      selected.id,
                    )}
                  >
                    {ORGANIZER_ICE_BOOKING_STATUS_LABELS[selected.bookingStatus]}
                  </span>
                </div>

                <div className="hockey-stack hockey-stack--gap-6">
                  <Text variant="subheader-2">Кратко</Text>
                  <Text
                    data-testid={testId('events', 'agreements', 'text', 'detail-when', selected.id)}
                  >
                    {formatAgreementInterval(selected.startsAt, selected.endsAt)}
                  </Text>
                  {selected.slotLabel ? <Text color="secondary">{selected.slotLabel}</Text> : null}
                  {selected.priceRub != null ? (
                    <Text
                      data-testid={testId(
                        'events',
                        'agreements',
                        'text',
                        'detail-price',
                        selected.id,
                      )}
                    >
                      Стоимость: {selected.priceRub.toLocaleString('ru-RU')} ₽
                    </Text>
                  ) : (
                    <Text color="secondary">Стоимость ещё не согласована</Text>
                  )}
                  {selected.headcount ? (
                    <Text color="secondary">Состав: {selected.headcount}</Text>
                  ) : null}
                  {selected.purpose ? (
                    <Text color="secondary">Цель: {selected.purpose}</Text>
                  ) : null}
                  {selected.comment ? (
                    <Text
                      color="secondary"
                      data-testid={testId(
                        'events',
                        'agreements',
                        'text',
                        'detail-comment',
                        selected.id,
                      )}
                    >
                      Комментарий: {selected.comment}
                    </Text>
                  ) : null}
                  {selected.confirmationCode ? (
                    <Text color="secondary">Код: {selected.confirmationCode}</Text>
                  ) : null}
                </div>

                <div className="hockey-stack hockey-stack--gap-6">
                  <Text variant="subheader-2">Контакты</Text>
                  {selected.arenaPhone ? (
                    <Text
                      data-testid={testId(
                        'events',
                        'agreements',
                        'text',
                        'detail-phone',
                        selected.id,
                      )}
                    >
                      Телефон арены:{' '}
                      <a href={`tel:${selected.arenaPhone.replace(/\s/g, '')}`}>
                        {selected.arenaPhone}
                      </a>
                    </Text>
                  ) : (
                    <Text color="secondary">Телефон арены не указан</Text>
                  )}
                  {selected.requesterPhone ? (
                    <Text color="secondary">Ваш телефон в заявке: {selected.requesterPhone}</Text>
                  ) : null}
                </div>

                <div className="hockey-row hockey-row--gap-8 hockey-row--wrap">
                  <HockeyButton
                    view="action"
                    size="m"
                    loading={chatMutation.isPending}
                    disabled={!selected.chatId && !selected.arenaContactUserId}
                    onClick={() => chatMutation.mutate(selected)}
                    data-testid={testId('events', 'agreements', 'btn', 'chat', selected.id)}
                  >
                    {selected.chatId ? 'Открыть чат' : 'Написать арене'}
                  </HockeyButton>
                  {isAgreementReadyForTraining(selected) ? (
                    <Link
                      to={agreementCreatePath(selected)}
                      data-testid={testId('events', 'agreements', 'link', 'create', selected.id)}
                    >
                      <HockeyButton
                        view="outlined"
                        size="m"
                        data-testid={testId('events', 'agreements', 'btn', 'create', selected.id)}
                      >
                        Создать тренировку
                      </HockeyButton>
                    </Link>
                  ) : null}
                  <Link
                    to={arenaDetailsPath(selected.arenaId)}
                    data-testid={testId('events', 'agreements', 'link', 'arena', selected.id)}
                  >
                    <HockeyButton
                      view="flat"
                      size="m"
                      data-testid={testId('events', 'agreements', 'btn', 'arena', selected.id)}
                    >
                      Страница арены
                    </HockeyButton>
                  </Link>
                </div>
              </div>
            </IceCard>
          ) : null}
        </div>
      )}

      <Link to={routes.arenas} data-testid={testId('events', 'agreements', 'link', 'arenas')}>
        <HockeyButton
          view="outlined"
          size="s"
          data-testid={testId('events', 'agreements', 'btn', 'arenas')}
        >
          Каталог арен — новая заявка
        </HockeyButton>
      </Link>
    </div>
  )
}
