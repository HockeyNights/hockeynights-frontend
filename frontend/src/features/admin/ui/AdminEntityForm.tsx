/**
 * SPEC-FR-11.1.1
 */

import {Select, TextInput} from '@gravity-ui/uikit'
import {useMutation, useQueryClient} from '@tanstack/react-query'
import {useState} from 'react'

import type {AdminEntityType} from '@/entities/admin'
import {createAdminEntity} from '@/entities/admin'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'

const ENTITY_OPTIONS = [
  {value: 'arena', content: 'Арена'},
  {value: 'league', content: 'Лига'},
  {value: 'shop', content: 'Магазин'},
]

/**
 * @spec SPEC-FR-11.1.1 - Форма ручного добавления сущности
 * Заголовок «Добавить запись» и карточку рисует страница.
 */
export function AdminEntityForm() {
  const queryClient = useQueryClient()
  const [entityType, setEntityType] = useState<AdminEntityType>('arena')
  const [name, setName] = useState('')
  const [city, setCity] = useState('Москва')
  const [websiteUrl, setWebsiteUrl] = useState('')

  const mutation = useMutation({
    mutationFn: createAdminEntity,
    onSuccess: () => {
      setName('')
      setWebsiteUrl('')
      void queryClient.invalidateQueries({queryKey: ['admin-sources']})
      void queryClient.invalidateQueries({queryKey: ['arenas']})
      void queryClient.invalidateQueries({queryKey: ['leagues']})
      void queryClient.invalidateQueries({queryKey: ['shops']})
    },
  })

  function handleSubmit() {
    if (!name.trim()) return
    mutation.mutate({entityType, name, city, websiteUrl: websiteUrl || undefined})
  }

  return (
    <div
      className="partner-cabinet__form admin-cabinet__entity-form"
      data-testid={testId('admin', 'entity-form', 'form')}
    >
      <Select
        label="Тип"
        width="max"
        value={[entityType]}
        onUpdate={(v) => setEntityType(v[0] as AdminEntityType)}
        options={ENTITY_OPTIONS}
        data-testid={testId('admin', 'entity-form', 'select', 'type')}
      />
      <TextInput
        label="Название"
        value={name}
        onUpdate={setName}
        data-testid={testId('admin', 'entity-form', 'field', 'name')}
      />
      <TextInput
        label="Город"
        value={city}
        onUpdate={setCity}
        data-testid={testId('admin', 'entity-form', 'field', 'city')}
      />
      <TextInput
        label="Сайт"
        value={websiteUrl}
        onUpdate={setWebsiteUrl}
        data-testid={testId('admin', 'entity-form', 'field', 'website')}
      />
      <HockeyButton
        width="max"
        loading={mutation.isPending}
        data-testid={testId('admin', 'entity-form', 'btn', 'create')}
        onClick={handleSubmit}
      >
        Создать
      </HockeyButton>
    </div>
  )
}
