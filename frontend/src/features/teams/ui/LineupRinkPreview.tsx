/**
 * HOCFRONT-25 — визуальная раскладка на льду (превью / редактор слотов)
 */

import {Text} from '@gravity-ui/uikit'
import {type DragEvent, useState} from 'react'

import type {PlayerPosition} from '@/entities/common'
import type {TrainingDraftAssignment} from '@/entities/team'
import {testId} from '@/shared/testing/testId'

import {formatPlayersCount} from '../lib/formatPlayersCount'
import {FifaPlayerCardModal} from './FifaPlayerCardModal'

type TeamSide = 'red' | 'white'

type RinkSlot = {
  id: string
  side: TeamSide
  position: PlayerPosition
  line: number
  x: number
  y: number
  label: string
}

const RINK_SLOTS: RinkSlot[] = [
  {id: 'red-goalie-1', side: 'red', position: 'goalie', line: 1, x: 8, y: 50, label: 'G'},
  {id: 'red-defense-1', side: 'red', position: 'defense', line: 1, x: 24, y: 30, label: 'LD'},
  {id: 'red-defense-2', side: 'red', position: 'defense', line: 2, x: 24, y: 70, label: 'RD'},
  {id: 'red-forward-1', side: 'red', position: 'forward', line: 1, x: 40, y: 25, label: 'LW'},
  {id: 'red-forward-2', side: 'red', position: 'forward', line: 2, x: 40, y: 50, label: 'C'},
  {id: 'red-forward-3', side: 'red', position: 'forward', line: 3, x: 40, y: 75, label: 'RW'},
  {id: 'white-goalie-1', side: 'white', position: 'goalie', line: 1, x: 92, y: 50, label: 'G'},
  {id: 'white-defense-1', side: 'white', position: 'defense', line: 1, x: 76, y: 30, label: 'LD'},
  {id: 'white-defense-2', side: 'white', position: 'defense', line: 2, x: 76, y: 70, label: 'RD'},
  {id: 'white-forward-1', side: 'white', position: 'forward', line: 1, x: 60, y: 25, label: 'LW'},
  {id: 'white-forward-2', side: 'white', position: 'forward', line: 2, x: 60, y: 50, label: 'C'},
  {id: 'white-forward-3', side: 'white', position: 'forward', line: 3, x: 60, y: 75, label: 'RW'},
]

export interface LineupRinkPreviewProps {
  assignments: TrainingDraftAssignment[]
  canEdit?: boolean
  onDropToSlot?: (userId: string, slot: Pick<RinkSlot, 'side' | 'position' | 'line'>) => void
  onDropToBench?: (userId: string) => void
  testIdPrefix?: string
}

export function LineupRinkPreview({
  assignments,
  canEdit = false,
  onDropToSlot,
  onDropToBench,
  testIdPrefix = 'lineup-rink',
}: LineupRinkPreviewProps) {
  const [activeDropZone, setActiveDropZone] = useState<string | null>(null)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)

  const selectedPlayer = selectedPlayerId
    ? assignments.find((item) => item.userId === selectedPlayerId)
    : null

  function playerForSlot(slot: RinkSlot) {
    return assignments.find(
      (item) =>
        item.side === slot.side &&
        item.position === slot.position &&
        (item.line ?? 1) === slot.line,
    )
  }

  const bench = assignments.filter((item) => item.side === 'bench')
  const onIceIds = new Set(
    RINK_SLOTS.map((slot) => playerForSlot(slot)?.userId).filter(Boolean) as string[],
  )
  const unplaced = assignments.filter((item) => item.side !== 'bench' && !onIceIds.has(item.userId))
  const redCount = assignments.filter((item) => item.side === 'red').length
  const whiteCount = assignments.filter((item) => item.side === 'white').length

  function onDragStart(userId: string, event: DragEvent<HTMLElement>) {
    if (!canEdit) return
    event.dataTransfer.setData('text/user-id', userId)
    event.dataTransfer.effectAllowed = 'move'
  }

  function openPlayerCard(userId: string) {
    setSelectedPlayerId(userId)
  }

  function applyDrop(
    target: {side: TrainingDraftAssignment['side']; position?: PlayerPosition; line?: number},
    event: DragEvent<HTMLElement>,
  ) {
    event.preventDefault()
    setActiveDropZone(null)
    if (!canEdit) return
    const userId = event.dataTransfer.getData('text/user-id')
    if (!userId) return
    if (target.side === 'bench') {
      onDropToBench?.(userId)
      return
    }
    if (target.position && target.line) {
      onDropToSlot?.(userId, {
        side: target.side as TeamSide,
        position: target.position,
        line: target.line,
      })
    }
  }

  return (
    <div
      className="lineup-board hockey-stack hockey-stack--gap-12"
      data-testid={testId('teams', testIdPrefix, 'panel')}
    >
      <div
        className="lineup-board__rink-wrap"
        data-testid={testId('teams', testIdPrefix, 'panel', 'rink')}
      >
        <div className="lineup-board__rink" data-testid={testId('teams', testIdPrefix, 'map')}>
          <div className="lineup-board__rink-center-line" />
          <div className="lineup-board__rink-circle" aria-hidden />
          <div className="lineup-board__rink-zone lineup-board__rink-zone--red" />
          <div className="lineup-board__rink-zone lineup-board__rink-zone--white" />
          {RINK_SLOTS.map((slot) => {
            const player = playerForSlot(slot)
            const zoneId = `rink-${slot.id}`
            return (
              <div
                key={slot.id}
                className={`lineup-board__rink-slot ${activeDropZone === zoneId ? 'is-drop-active' : ''}`}
                style={{left: `${slot.x}%`, top: `${slot.y}%`}}
                onDragOver={(event) => event.preventDefault()}
                onDragEnter={() => canEdit && setActiveDropZone(zoneId)}
                onDragLeave={() => setActiveDropZone((prev) => (prev === zoneId ? null : prev))}
                onDrop={(event) =>
                  applyDrop({side: slot.side, position: slot.position, line: slot.line}, event)
                }
                data-testid={testId('teams', testIdPrefix, 'cell', slot.id)}
              >
                {player ? (
                  <button
                    type="button"
                    draggable={canEdit}
                    onDragStart={(event) => onDragStart(player.userId, event)}
                    onClick={() => openPlayerCard(player.userId)}
                    className={`lineup-board__player-card lineup-board__player-card--${slot.side}`}
                    data-testid={testId('teams', testIdPrefix, 'card', player.userId)}
                  >
                    <div className="lineup-board__player-number">
                      {player.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="lineup-board__player-info">
                      <span className="lineup-board__player-name">
                        {player.displayName.split(' ').pop()}
                      </span>
                      <span className="lineup-board__player-position">{slot.label}</span>
                    </div>
                  </button>
                ) : (
                  <div className="lineup-board__rink-empty">
                    <span className="lineup-board__rink-empty-label">{slot.label}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div className="lineup-board__legend">
          <div className="lineup-board__legend-item">
            <span className="lineup-board__legend-dot lineup-board__legend-dot--red" />
            <Text color="secondary">Красные ({formatPlayersCount(redCount)})</Text>
          </div>
          <div className="lineup-board__legend-item">
            <span className="lineup-board__legend-dot lineup-board__legend-dot--white" />
            <Text color="secondary">Белые ({formatPlayersCount(whiteCount)})</Text>
          </div>
          <div className="lineup-board__legend-item">
            <span className="lineup-board__legend-dot lineup-board__legend-dot--free" />
            <Text color="secondary">Свободный слот позиции</Text>
          </div>
        </div>
      </div>

      <div className="lineup-board__utility">
        <div className="lineup-board__utility-section">
          <p className="lineup-board__utility-title">Запасные ({bench.length})</p>
          <ul
            className={`lineup-board__list ${activeDropZone === 'bench' ? 'is-drop-active' : ''}`}
            onDragOver={(event) => event.preventDefault()}
            onDragEnter={() => canEdit && setActiveDropZone('bench')}
            onDragLeave={() => setActiveDropZone((prev) => (prev === 'bench' ? null : prev))}
            onDrop={(event) => applyDrop({side: 'bench'}, event)}
            data-testid={testId('teams', testIdPrefix, 'list', 'bench')}
          >
            {bench.length === 0 && (
              <li className="lineup-board__list-empty">
                <Text color="secondary">Перетащите сюда игроков со льда для отдыха</Text>
              </li>
            )}
            {bench.map((player) => (
              <li key={player.userId}>
                <button
                  type="button"
                  className="lineup-board__list-item"
                  draggable={canEdit}
                  onDragStart={(event) => onDragStart(player.userId, event)}
                  onClick={() => openPlayerCard(player.userId)}
                  data-testid={testId('teams', testIdPrefix, 'row', 'bench', player.userId)}
                >
                  <span className="lineup-board__list-avatar" aria-hidden>
                    {player.displayName.charAt(0).toUpperCase()}
                  </span>
                  <Text className="lineup-board__list-name">{player.displayName}</Text>
                  <span className="hockey-badge hockey-badge--muted lineup-board__list-tag">
                    {player.position}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        {unplaced.length > 0 && (
          <div className="lineup-board__utility-section">
            <p className="lineup-board__utility-title">На льду (вне слотов) ({unplaced.length})</p>
            <ul className="lineup-board__list">
              {unplaced.map((player) => (
                <li key={player.userId}>
                  <button
                    type="button"
                    className="lineup-board__list-item"
                    draggable={canEdit}
                    onDragStart={(event) => onDragStart(player.userId, event)}
                    onClick={() => openPlayerCard(player.userId)}
                    data-testid={testId('teams', testIdPrefix, 'row', 'unplaced', player.userId)}
                  >
                    <span className="lineup-board__list-avatar" aria-hidden>
                      {player.displayName.charAt(0).toUpperCase()}
                    </span>
                    <Text className="lineup-board__list-name">{player.displayName}</Text>
                    <span className="hockey-badge hockey-badge--muted lineup-board__list-tag">
                      {player.side} · {player.position}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <FifaPlayerCardModal
        open={Boolean(selectedPlayerId)}
        userId={selectedPlayerId}
        displayNameFallback={selectedPlayer?.displayName}
        positionFallback={selectedPlayer?.position}
        onClose={() => setSelectedPlayerId(null)}
      />
    </div>
  )
}
