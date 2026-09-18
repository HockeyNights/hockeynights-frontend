/**
 * SPEC-FR-2.1.1, SPEC-FR-25.1.1
 * Быстрый демо-доступ на экране входа.
 */

import {ArrowRightOutlined} from '@ant-design/icons'
import {Button} from 'antd'

import {testId} from '@/shared/testing/testId'

export interface AuthDemoCardProps {
  onApply: () => void
}

export function AuthDemoCard({onApply}: AuthDemoCardProps) {
  return (
    <Button
      type="default"
      size="large"
      block
      className="auth-demo-btn"
      onClick={onApply}
      aria-label="Быстрый доступ"
      data-testid={testId('auth', 'login', 'btn', 'apply-demo')}
    >
      <span
        className="auth-demo-btn__badge"
        data-testid={testId('auth', 'login', 'text', 'demo-badge')}
      >
        Демо
      </span>
      <span
        className="auth-demo-btn__label"
        data-testid={testId('auth', 'login', 'text', 'demo-label')}
      >
        Быстрый доступ
      </span>
      <span className="auth-demo-btn__arrow" aria-hidden>
        <ArrowRightOutlined />
      </span>
    </Button>
  )
}
