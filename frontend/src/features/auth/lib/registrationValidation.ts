/** Валидация формы регистрации (Phase 1, клиентская) */

export interface RegisterFormValues {
  displayName: string
  email: string
  password: string
  passwordConfirm: string
  acceptTerms: boolean
}

export interface ValidateRegisterFormOptions {
  /** Phase 1 mock API не принимает acceptTerms — проверка только на клиенте */
  requireTerms?: boolean
  /** Backend Public API: минимум 8 символов */
  minPasswordLength?: number
  /** Backend: имя уходит в create-profile, на register необязательно */
  requireDisplayName?: boolean
}

function validateRegisterCore(
  displayName: string,
  email: string,
  password: string,
  passwordConfirm: string | null,
  acceptTerms: boolean | null,
  options: ValidateRegisterFormOptions,
): string | null {
  const requireTerms = options.requireTerms ?? true
  const minPasswordLength = options.minPasswordLength ?? 6
  const requireDisplayName = options.requireDisplayName ?? true

  if (requireDisplayName && displayName.length < 2) {
    return 'Введите имя (не менее 2 символов)'
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Введите корректный email'
  }
  if (password.length < minPasswordLength) {
    return `Пароль должен быть не короче ${minPasswordLength} символов`
  }
  if (passwordConfirm !== null && password !== passwordConfirm) {
    return 'Пароли не совпадают'
  }
  if (requireTerms && acceptTerms !== null && !acceptTerms) {
    return 'Примите условия использования'
  }
  return null
}

export function validateRegisterForm(
  values: RegisterFormValues,
  options: ValidateRegisterFormOptions = {},
): string | null {
  return validateRegisterCore(
    values.displayName.trim(),
    values.email.trim(),
    values.password,
    values.passwordConfirm,
    values.acceptTerms,
    options,
  )
}

/** Серверная mock-валидация POST /register (без confirm/terms в теле запроса). */
export function validateRegisterPayload(payload: {
  displayName?: string
  email?: string
  password?: string
}): string | null {
  return validateRegisterCore(
    (payload.displayName ?? '').trim(),
    (payload.email ?? '').trim(),
    payload.password ?? '',
    null,
    null,
    {requireTerms: false},
  )
}
