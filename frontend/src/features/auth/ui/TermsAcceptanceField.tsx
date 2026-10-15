/**
 * SPEC-FR-2.1.1
 * Чекбокс принятия условий — компактная однострочная разметка.
 */

import {Checkbox} from 'antd'
import {Link} from 'react-router'

import {testId} from '@/shared/testing/testId'

export interface TermsAcceptanceFieldProps {
  checked: boolean
  onUpdate: (checked: boolean) => void
}

export function TermsAcceptanceField({checked, onUpdate}: TermsAcceptanceFieldProps) {
  return (
    <div className="auth-terms-field" data-testid={testId('auth', 'register', 'panel', 'terms')}>
      <Checkbox
        className="auth-terms-field__checkbox"
        checked={checked}
        onChange={(event) => onUpdate(event.target.checked)}
        data-testid={testId('auth', 'register', 'checkbox', 'terms')}
      >
        <span className="auth-terms-field__label">
          Я принимаю{' '}
          <Link
            to="/terms"
            className="auth-terms-field__link"
            data-testid={testId('auth', 'register', 'link', 'terms')}
          >
            условия использования
          </Link>
        </span>
      </Checkbox>
    </div>
  )
}
