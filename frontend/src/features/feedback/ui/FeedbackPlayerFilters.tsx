/**
 * SPEC-FR-8.1.1 — фильтры списка «Игрок для оценки»
 */

import {Checkbox, Select} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {useMemo} from 'react'

import type {PlayerPosition, SkillLevel} from '@/entities/common'
import {fetchPlayers, type PlayersFilterParams} from '@/entities/profile'
import {fetchTeams} from '@/entities/team'
import {POSITION_LABELS, SKILL_LEVEL_LABELS} from '@/features/events'
import {testId} from '@/shared/testing/testId'

export interface FeedbackPlayerFiltersProps {
  filters: PlayersFilterParams
  onChange: (filters: PlayersFilterParams) => void
}

const POSITION_OPTIONS = (['forward', 'defense', 'goalie'] as PlayerPosition[]).map((value) => ({
  value,
  content: POSITION_LABELS[value],
}))

const SKILL_OPTIONS = (
  [
    'beginner',
    'amateur',
    'novice_theorist',
    'theorist',
    'confident_theorist',
    'practitioner',
    'master',
  ] as SkillLevel[]
).map((value) => ({value, content: SKILL_LEVEL_LABELS[value]}))

function uniqueOptions(values: (string | undefined)[]) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))))
    .sort((a, b) => a.localeCompare(b, 'ru'))
    .map((value) => ({value, content: value}))
}

export function FeedbackPlayerFilters({filters, onChange}: FeedbackPlayerFiltersProps) {
  const {data: players = []} = useQuery({queryKey: ['players'], queryFn: () => fetchPlayers()})
  const {data: teams = []} = useQuery({queryKey: ['teams'], queryFn: () => fetchTeams()})

  const districtOptions = useMemo(
    () => uniqueOptions(players.map((player) => player.district)),
    [players],
  )
  const cityOptions = useMemo(
    () => uniqueOptions([...players.map((player) => player.city), ...teams.map((t) => t.city)]),
    [players, teams],
  )
  const teamOptions = useMemo(
    () => teams.map((team) => ({value: team.id, content: team.name})),
    [teams],
  )

  function selectField(
    key: 'position' | 'skillLevel' | 'district' | 'teamId' | 'city',
    placeholder: string,
    options: {value: string; content: string}[],
  ) {
    const value = filters[key]
    return (
      <Select
        key={key}
        placeholder={placeholder}
        value={value ? [value] : []}
        onUpdate={(next) => onChange({...filters, [key]: next[0] || undefined})}
        options={options}
        hasClear
        width="max"
        size="l"
        data-testid={testId('feedback', 'player-filters', 'select', key)}
      />
    )
  }

  return (
    <div
      className="hockey-feedback-filters"
      data-testid={testId('feedback', 'player-filters', 'panel')}
    >
      <span
        className="hockey-feedback-filters__title"
        data-testid={testId('feedback', 'player-filters', 'text', 'title')}
      >
        Фильтры
      </span>
      {selectField('position', 'Амплуа', POSITION_OPTIONS)}
      {selectField('skillLevel', 'Уровень', SKILL_OPTIONS)}
      {selectField('district', 'Район', districtOptions)}
      {selectField('teamId', 'Команда', teamOptions)}
      {selectField('city', 'Город', cityOptions)}
      <Checkbox
        size="l"
        className="hockey-feedback-filters__toggle"
        content="Только подтверждённые"
        checked={Boolean(filters.verified)}
        onUpdate={(checked) => onChange({...filters, verified: checked || undefined})}
        data-testid={testId('feedback', 'player-filters', 'checkbox', 'verified')}
      />
      <Checkbox
        size="l"
        className="hockey-feedback-filters__toggle"
        content="Только вратари"
        checked={Boolean(filters.goalieOnly)}
        onUpdate={(checked) => onChange({...filters, goalieOnly: checked || undefined})}
        data-testid={testId('feedback', 'player-filters', 'checkbox', 'goalie-only')}
      />
    </div>
  )
}
