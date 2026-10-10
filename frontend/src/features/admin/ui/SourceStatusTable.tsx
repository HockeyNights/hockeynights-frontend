/**
 * SPEC-FR-11.2.1, SPEC-FR-11.2.2
 */

import {Text} from '@gravity-ui/uikit'

import type {SourceStatusItem} from '@/entities/admin'
import {VisibilityToggle} from '@/features/admin/ui/VisibilityToggle'
import {testId} from '@/shared/testing/testId'
import {IceCard} from '@/shared/ui/IceCard'
import {SourceMetaBadge} from '@/shared/ui/SourceMetaBadge'

/** @spec SPEC-FR-11.2.1 - Props таблицы источников */
export interface SourceStatusTableProps {
  /** @spec SPEC-FR-11.2.1 */
  items: SourceStatusItem[]
}

const TYPE_LABELS: Record<SourceStatusItem['entityType'], string> = {
  arena: 'Арена',
  league: 'Лига',
  shop: 'Магазин',
}

/**
 * @spec SPEC-FR-11.2.1 - Статусы источников данных
 * @spec SPEC-FR-11.1.2 - Управление видимостью
 */
export function SourceStatusTable({items}: SourceStatusTableProps) {
  if (items.length === 0) {
    return (
      <Text color="secondary" data-testid={testId('admin', 'source-table', 'empty')}>
        Нет данных
      </Text>
    )
  }

  return (
    <IceCard
      padding="m"
      className="partner-cabinet__card admin-cabinet__sources"
      data-testid={testId('admin', 'source-table', 'table')}
    >
      <div>
        {items.map((item) => (
          <div
            key={`${item.entityType}-${item.entityId}`}
            className="admin-source-table__row"
            data-testid={testId('admin', 'source-table', 'row', item.entityType, item.entityId)}
          >
            <Text
              color="secondary"
              data-testid={testId(
                'admin',
                'source-table',
                'cell',
                'type',
                item.entityType,
                item.entityId,
              )}
            >
              {TYPE_LABELS[item.entityType]}
            </Text>
            <Text
              data-testid={testId(
                'admin',
                'source-table',
                'cell',
                'name',
                item.entityType,
                item.entityId,
              )}
            >
              {item.entityName}
            </Text>
            <span
              data-testid={testId(
                'admin',
                'source-table',
                'cell',
                'source',
                item.entityType,
                item.entityId,
              )}
            >
              <SourceMetaBadge sourceMeta={item.sourceMeta} />
            </span>
            <VisibilityToggle
              entityId={item.entityId}
              entityType={item.entityType}
              visible={item.visible}
            />
          </div>
        ))}
      </div>
    </IceCard>
  )
}
