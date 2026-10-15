/**
 * HOCFRONT-25 — студия постановок: разные схемы состава + сохранение в шаблоны
 */

import {Select, Text, TextInput} from '@gravity-ui/uikit'
import {useQuery} from '@tanstack/react-query'
import {useEffect, useMemo, useState} from 'react'

import type {PlayerPosition} from '@/entities/common'
import {fetchTeamRoster, type TrainingDraftAssignment} from '@/entities/team'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardLoader} from '@/shared/ui/ScoreboardLoader'
import {SectionHeading} from '@/shared/ui/SectionHeading'

import {
  createTeamLineupTemplate,
  loadTeamLineupTemplates,
  saveTeamLineupTemplates,
  type TeamLineupTemplate,
} from '../lib/lineupTemplates'
import {LineupRinkPreview} from './LineupRinkPreview'

export interface TeamLineupStudioProps {
  teamId: string
  canEdit: boolean
}

function buildDefaultAssignments(
  roster: Array<{userId: string; displayName: string; position: PlayerPosition | 'any'}>,
): TrainingDraftAssignment[] {
  return roster.map((member, index) => ({
    userId: member.userId,
    displayName: member.displayName,
    position: (member.position === 'any' ? 'forward' : member.position) as PlayerPosition,
    side: index < 3 ? 'red' : index < 6 ? 'white' : 'bench',
    line: ((index % 3) + 1) as number,
  }))
}

function mergeAssignmentsWithRoster(
  prev: TrainingDraftAssignment[],
  roster: Array<{userId: string; displayName: string; position: PlayerPosition | 'any'}>,
): TrainingDraftAssignment[] {
  if (roster.length === 0) return []
  if (prev.length === 0) return buildDefaultAssignments(roster)
  const byUser = new Map(prev.map((item) => [item.userId, item]))
  return roster.map((member) => {
    const existing = byUser.get(member.userId)
    if (existing) {
      return {...existing, displayName: member.displayName}
    }
    return {
      userId: member.userId,
      displayName: member.displayName,
      position: (member.position === 'any' ? 'forward' : member.position) as PlayerPosition,
      side: 'bench' as const,
      line: 1,
    }
  })
}

export function TeamLineupStudio({teamId, canEdit}: TeamLineupStudioProps) {
  const [templates, setTemplates] = useState<TeamLineupTemplate[]>(() =>
    loadTeamLineupTemplates(teamId),
  )
  const [templateName, setTemplateName] = useState('')
  const [assignments, setAssignments] = useState<TrainingDraftAssignment[]>([])
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [syncedTeamId, setSyncedTeamId] = useState(teamId)
  const [syncedRosterKey, setSyncedRosterKey] = useState('')

  const {data: roster = [], isLoading} = useQuery({
    queryKey: ['roster', teamId],
    queryFn: () => fetchTeamRoster(teamId),
  })

  const activeRoster = useMemo(
    () => roster.filter((member) => member.rosterStatus !== 'removed'),
    [roster],
  )
  const rosterKey = `${teamId}:${activeRoster.map((member) => member.userId).join('|')}`

  useEffect(() => {
    if (teamId === syncedTeamId) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- remount studio state for new team
    setSyncedTeamId(teamId)
    setTemplates(loadTeamLineupTemplates(teamId))
    setAssignments([])
    setSyncedRosterKey('')
    setStatusMessage(null)
  }, [teamId, syncedTeamId])

  useEffect(() => {
    if (isLoading) return
    if (rosterKey === syncedRosterKey) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional roster hydrate
    setSyncedRosterKey(rosterKey)
    setAssignments((prev) => mergeAssignmentsWithRoster(prev, activeRoster))
  }, [isLoading, rosterKey, syncedRosterKey, activeRoster])

  function persistTemplates(next: TeamLineupTemplate[]) {
    setTemplates(next)
    saveTeamLineupTemplates(teamId, next)
  }

  function updatePlayer(
    userId: string,
    patch: Partial<Pick<TrainingDraftAssignment, 'side' | 'position' | 'line'>>,
  ) {
    setAssignments((prev) =>
      prev.map((item) => {
        if (item.userId !== userId) {
          if (
            patch.side &&
            patch.side !== 'bench' &&
            patch.position &&
            patch.line &&
            item.side === patch.side &&
            item.position === patch.position &&
            (item.line ?? 1) === patch.line
          ) {
            return {...item, side: 'bench'}
          }
          return item
        }
        return {...item, ...patch}
      }),
    )
  }

  function saveTemplate() {
    const name = templateName.trim()
    if (!name || !canEdit) return
    const template = createTeamLineupTemplate(
      name,
      assignments.map((item) => ({
        userId: item.userId,
        displayName: item.displayName,
        position: item.position,
        side: item.side,
        line: item.line,
      })),
    )
    persistTemplates([template, ...templates])
    setTemplateName('')
    setStatusMessage(`Шаблон «${template.name}» сохранён`)
  }

  function loadTemplate(templateId: string) {
    const template = templates.find((item) => item.id === templateId)
    if (!template) return
    const byUser = new Map(template.assignments.map((item) => [item.userId, item]))
    setAssignments(
      activeRoster.map((member) => {
        const fromTpl = byUser.get(member.userId)
        if (
          !fromTpl ||
          (fromTpl.side !== 'red' && fromTpl.side !== 'white' && fromTpl.side !== 'bench')
        ) {
          return {
            userId: member.userId,
            displayName: member.displayName,
            position: (member.position === 'any' ? 'forward' : member.position) as PlayerPosition,
            side: 'bench' as const,
            line: 1,
          }
        }
        return {
          userId: member.userId,
          displayName: member.displayName,
          position: fromTpl.position,
          side: fromTpl.side,
          line: fromTpl.line ?? 1,
        }
      }),
    )
    setStatusMessage(`Загружен шаблон «${template.name}»`)
  }

  function deleteTemplate(templateId: string) {
    persistTemplates(templates.filter((item) => item.id !== templateId))
    setStatusMessage('Шаблон удалён')
  }

  if (isLoading) {
    return (
      <ScoreboardLoader
        label="Загрузка студии состава"
        data-testid={testId('teams', 'lineup-studio', 'loader', teamId)}
      />
    )
  }

  return (
    <section
      className="lineup-studio"
      data-testid={testId('teams', 'lineup-studio', 'section', teamId)}
    >
      <SectionHeading
        title={
          <span data-testid={testId('teams', 'lineup-studio', 'text', 'title', teamId)}>
            Постановки и шаблоны
          </span>
        }
      />
      <IceCard
        padding="m"
        className="lineup-studio__card"
        data-testid={testId('teams', 'lineup-studio', 'card', teamId)}
      >
        <div
          className="lineup-studio__toolbar"
          data-testid={testId('teams', 'lineup-studio', 'panel', 'templates', teamId)}
        >
          <Text
            color="secondary"
            className="lineup-studio__hint"
            data-testid={testId('teams', 'lineup-studio', 'text', 'hint', teamId)}
          >
            Собирайте постановки на льду и сохраняйте шаблоны — их можно подставить при создании
            тренировки
          </Text>
          <div className="lineup-studio__controls">
            <TextInput
              size="l"
              value={templateName}
              onUpdate={setTemplateName}
              placeholder="Название шаблона"
              disabled={!canEdit}
              className="lineup-studio__name"
              controlProps={{'aria-label': 'Название шаблона'}}
              data-testid={testId('teams', 'lineup-studio', 'field', 'template-name', teamId)}
            />
            <HockeyButton
              view="action"
              size="l"
              disabled={!canEdit || !templateName.trim()}
              onClick={saveTemplate}
              data-testid={testId('teams', 'lineup-studio', 'btn', 'save-template', teamId)}
            >
              Сохранить
            </HockeyButton>
            <Select
              size="l"
              value={[]}
              placeholder="Загрузить шаблон"
              aria-label="Загрузить шаблон"
              disabled={templates.length === 0}
              className="lineup-studio__load"
              options={templates.map((item) => ({
                value: item.id,
                content: `${item.name} · ${new Date(item.updatedAt).toLocaleDateString('ru-RU')}`,
              }))}
              onUpdate={(value) => {
                if (value[0]) loadTemplate(String(value[0]))
              }}
              data-testid={testId('teams', 'lineup-studio', 'select', 'load-template', teamId)}
            />
          </div>
        </div>

        {templates.length > 0 && (
          <div
            className="lineup-studio__templates"
            data-testid={testId('teams', 'lineup-studio', 'list', 'templates', teamId)}
          >
            {templates.map((item) => (
              <div
                key={item.id}
                className="lineup-studio__template"
                data-testid={testId('teams', 'lineup-studio', 'row', 'template', item.id)}
              >
                <HockeyButton
                  size="s"
                  view="outlined"
                  onClick={() => loadTemplate(item.id)}
                  data-testid={testId('teams', 'lineup-studio', 'btn', 'apply', item.id)}
                >
                  {item.name}
                </HockeyButton>
                {canEdit && (
                  <HockeyButton
                    size="s"
                    view="flat"
                    aria-label={`Удалить шаблон «${item.name}»`}
                    onClick={() => deleteTemplate(item.id)}
                    data-testid={testId('teams', 'lineup-studio', 'btn', 'delete', item.id)}
                  >
                    ✕
                  </HockeyButton>
                )}
              </div>
            ))}
          </div>
        )}

        <LineupRinkPreview
          assignments={assignments}
          canEdit={canEdit}
          testIdPrefix="lineup-studio"
          onDropToBench={(userId) => updatePlayer(userId, {side: 'bench'})}
          onDropToSlot={(userId, slot) =>
            updatePlayer(userId, {
              side: slot.side,
              position: slot.position,
              line: slot.line,
            })
          }
        />

        {statusMessage && (
          <Text
            color="secondary"
            data-testid={testId('teams', 'lineup-studio', 'text', 'status', teamId)}
          >
            {statusMessage}
          </Text>
        )}
      </IceCard>
    </section>
  )
}
