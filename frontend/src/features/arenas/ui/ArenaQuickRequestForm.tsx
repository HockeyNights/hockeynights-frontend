/**
 * SPEC-FR-6.2.2, SPEC-FR-6.4.2 — быстрая заявка на лёд для площадок без календаря слотов
 */

import {Select, Text, TextInput} from '@gravity-ui/uikit'
import {useMutation} from '@tanstack/react-query'
import {type FormEvent, useId, useState} from 'react'

import type {Arena} from '@/entities/arena'
import type {IceBookingRequest} from '@/entities/external-flow'
import {submitIceBooking} from '@/entities/external-flow'
import {useSessionAccess} from '@/features/access'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'

const TIME_OPTIONS = [
  {value: 'morning', content: 'Утро (06:00 - 12:00)'},
  {value: 'day', content: 'День (12:00 - 18:00)'},
  {value: 'evening', content: 'Вечер (18:00 - 23:00)'},
  {value: 'night', content: 'Ночь (23:00 - 02:00)'},
]

export interface ArenaQuickRequestFormProps {
  arena: Arena
}

function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  })
}

/**
 * @spec SPEC-FR-6.4.2 - Заявка на лёд прямо со страницы площадки
 */
export function ArenaQuickRequestForm({arena}: ArenaQuickRequestFormProps) {
  const {userId} = useSessionAccess()
  const ids = {date: useId(), time: useId(), phone: useId()}
  const [date, setDate] = useState('')
  const [time, setTime] = useState('evening')
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState(false)
  const [result, setResult] = useState<IceBookingRequest | null>(null)

  const mutation = useMutation({
    mutationFn: submitIceBooking,
    onSuccess: (booking) => setResult(booking),
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!phone.trim()) {
      setPhoneError(true)
      return
    }
    const timeLabel = TIME_OPTIONS.find((option) => option.value === time)?.content
    const comment = [
      date ? `Дата: ${formatDate(date)}` : null,
      timeLabel ? `Время: ${timeLabel}` : null,
    ]
      .filter(Boolean)
      .join(' · ')
    mutation.mutate({
      arenaId: arena.id,
      contactPhone: phone.trim(),
      comment: comment || undefined,
      organizerUserId: userId || undefined,
      purpose: 'Заявка на лёд',
      headcount: 'уточняется',
    })
  }

  const resetForm = () => {
    setResult(null)
    mutation.reset()
  }

  if (result) {
    return (
      <div
        className="arena-quick-request arena-quick-request--done"
        role="status"
        data-testid={testId('arenas', 'quick-request', 'panel', 'success', arena.id)}
      >
        <div className="arena-quick-request__title">Заявка отправлена</div>
        <Text data-testid={testId('arenas', 'quick-request', 'text', 'code', arena.id)}>
          Код подтверждения: <strong>{result.confirmationCode}</strong>
        </Text>
        <Text color="secondary">
          Администратор площадки увидит заявку со статусом «На рассмотрении» и свяжется с вами.
        </Text>
        <HockeyButton
          view="outlined"
          size="l"
          width="max"
          onClick={resetForm}
          data-testid={testId('arenas', 'quick-request', 'btn', 'again', arena.id)}
        >
          Новая заявка
        </HockeyButton>
      </div>
    )
  }

  return (
    <form
      className="arena-quick-request"
      onSubmit={handleSubmit}
      noValidate
      data-testid={testId('arenas', 'quick-request', 'form', arena.id)}
    >
      <div className="arena-quick-request__title">Быстрая заявка</div>
      <div className="arena-quick-request__fields">
        <div className="arena-quick-request__field">
          <label className="arena-quick-request__label" htmlFor={ids.date}>
            Желаемая дата
          </label>
          <input
            id={ids.date}
            type="date"
            className="arena-quick-request__native"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            data-testid={testId('arenas', 'quick-request', 'field', 'date', arena.id)}
          />
        </div>
        <div
          className="arena-quick-request__field"
          data-testid={testId('arenas', 'quick-request', 'field', 'time', arena.id)}
        >
          <label className="arena-quick-request__label" htmlFor={ids.time}>
            Удобное время
          </label>
          <Select
            id={ids.time}
            size="l"
            width="max"
            value={[time]}
            onUpdate={(value) => setTime(value[0] ?? 'evening')}
            options={TIME_OPTIONS}
          />
        </div>
        <div className="arena-quick-request__field">
          <label className="arena-quick-request__label" htmlFor={ids.phone}>
            Ваш телефон для связи
          </label>
          <TextInput
            id={ids.phone}
            size="l"
            type="tel"
            placeholder="+7 (___) ___-__-__"
            value={phone}
            onUpdate={(value) => {
              setPhone(value)
              if (value.trim()) setPhoneError(false)
            }}
            validationState={phoneError ? 'invalid' : undefined}
            errorMessage="Укажите телефон, чтобы администратор мог связаться"
            data-testid={testId('arenas', 'quick-request', 'field', 'phone', arena.id)}
          />
        </div>
      </div>
      {mutation.isError && (
        <Text
          color="danger"
          data-testid={testId('arenas', 'quick-request', 'text', 'error', arena.id)}
        >
          Не удалось отправить заявку
        </Text>
      )}
      <HockeyButton
        type="submit"
        view="action"
        size="l"
        width="max"
        loading={mutation.isPending}
        data-testid={testId('arenas', 'booking', 'btn', 'book', arena.id)}
      >
        Оставить заявку на лёд
      </HockeyButton>
    </form>
  )
}
