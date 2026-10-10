import type {PlayerPosition} from '@/entities/common'

import {POSITION_GROUP_LABELS, POSITION_SHORT_LABELS} from '../lib/positionGroups'

export interface TeamPositionBadgeProps {
  position: PlayerPosition
  'data-testid'?: string
}

/** Бейдж амплуа из макета: «ВР» зелёный, «ЗЩ» синий, «НП» жёлтый. */
export function TeamPositionBadge({position, 'data-testid': dataTestId}: TeamPositionBadgeProps) {
  return (
    <span
      className={`team-pos-badge team-pos-badge--${position}`}
      title={POSITION_GROUP_LABELS[position]}
      data-testid={dataTestId}
    >
      {POSITION_SHORT_LABELS[position]}
    </span>
  )
}
