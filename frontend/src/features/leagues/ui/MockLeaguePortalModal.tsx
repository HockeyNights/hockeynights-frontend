/**
 * SPEC-FR-7.1.3
 * Макет Figma 27:60686 / 27:60453 — mock «Сайт лиги»
 */

import {Button, Text} from '@gravity-ui/uikit'

import type {League} from '@/entities/league'
import {SKILL_LEVEL_LABELS} from '@/features/events'
import {testId} from '@/shared/testing/testId'
import {MockExternalFlowDialog} from '@/shared/ui/MockExternalFlowDialog'

/** @spec SPEC-FR-7.1.3 - Props mock-портала лиги */
export interface MockLeaguePortalModalProps {
  /** @spec SPEC-FR-7.1.3 */
  open: boolean
  /** @spec SPEC-FR-7.1.3 */
  onClose: () => void
  /** @spec SPEC-FR-7.1.2 */
  league: League
}

/**
 * @spec SPEC-FR-7.1.3 - Mock-превью сайта лиги
 */
export function MockLeaguePortalModal({open, onClose, league}: MockLeaguePortalModalProps) {
  const levelLabel = league.level ? (SKILL_LEVEL_LABELS[league.level] ?? league.level) : undefined

  return (
    <MockExternalFlowDialog
      open={open}
      onClose={onClose}
      flowType="league_portal"
      partnerName={league.name}
      externalUrl={league.websiteUrl}
      testIdPrefix="leagues"
      footer={
        <Button
          view="action"
          size="l"
          width="max"
          onClick={onClose}
          data-testid={testId('leagues', 'portal', 'modal', 'btn', 'close', league.id)}
        >
          Закрыть
        </Button>
      }
    >
      <div
        className="league-portal-modal"
        data-testid={testId('leagues', 'portal', 'modal', league.id)}
      >
        <dl className="league-portal-modal__facts">
          <div className="league-portal-modal__fact">
            <dt>Регион</dt>
            <dd data-testid={testId('leagues', 'portal', 'modal', 'text', 'region', league.id)}>
              {league.region}
            </dd>
          </div>
          {levelLabel ? (
            <div className="league-portal-modal__fact">
              <dt>Уровень</dt>
              <dd data-testid={testId('leagues', 'portal', 'modal', 'text', 'level', league.id)}>
                {levelLabel}
              </dd>
            </div>
          ) : null}
          <div className="league-portal-modal__fact">
            <dt>Интеграция</dt>
            <dd
              data-testid={testId('leagues', 'portal', 'modal', 'text', 'integration', league.id)}
            >
              {league.integrationStatus}
            </dd>
          </div>
        </dl>
        <Text
          color="secondary"
          className="league-portal-modal__copy"
          data-testid={testId('leagues', 'portal', 'modal', 'text', 'description', league.id)}
        >
          Mock-портал лиги: расписание, заявки, статистика. В Phase 2 — import/API партнёра.
        </Text>
      </div>
    </MockExternalFlowDialog>
  )
}
