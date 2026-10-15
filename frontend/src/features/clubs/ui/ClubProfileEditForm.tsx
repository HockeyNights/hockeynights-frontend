/**
 * HOCFRONT-25 / TASK-04-08 — редактирование профиля и штаба клуба
 */

import {Plus} from '@gravity-ui/icons'
import {Icon, Select, TextArea, TextInput} from '@gravity-ui/uikit'
import {useMutation, useQueryClient} from '@tanstack/react-query'
import {useId, useState} from 'react'

import type {Club, ClubStaffMember} from '@/entities/club'
import {updateClubProfile} from '@/entities/club'
import {STAFF_ROLE_LABELS, STAFF_ROLE_OPTIONS} from '@/features/teams'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {SectionHeading} from '@/shared/ui/SectionHeading'

export interface ClubProfileEditFormProps {
  club: Club
}

function emptyStaff(): ClubStaffMember {
  return {
    userId: `staff-${Date.now()}`,
    displayName: '',
    role: 'manager',
    contactEmail: '',
    contactPhone: '',
  }
}

/** HOCFRONT-25 — форма публичного профиля клуба и штаба */
export function ClubProfileEditForm({club}: ClubProfileEditFormProps) {
  const queryClient = useQueryClient()
  const fieldId = useId()
  const [name, setName] = useState(club.name)
  const [description, setDescription] = useState(club.description ?? '')
  const [contactEmail, setContactEmail] = useState(club.contactEmail ?? '')
  const [contactPhone, setContactPhone] = useState(club.contactPhone ?? '')
  const [staff, setStaff] = useState<ClubStaffMember[]>(club.staff)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const saveMutation = useMutation({
    mutationFn: () =>
      updateClubProfile(club.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        staff: staff.filter((member) => member.displayName.trim()),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({queryKey: ['club', club.id]})
      setStatusMessage('Профиль клуба сохранён.')
    },
    onError: (error) => {
      setStatusMessage(error instanceof Error ? error.message : 'Не удалось сохранить профиль')
    },
  })

  const updateStaff = (index: number, patch: Partial<ClubStaffMember>) => {
    setStaff((prev) => prev.map((member, i) => (i === index ? {...member, ...patch} : member)))
  }

  return (
    <div
      className="club-hq__profile"
      data-testid={testId('clubs', 'profile-edit', 'form', club.id)}
    >
      <section className="club-hq__section">
        <SectionHeading
          title="Профиль клуба"
          extra={
            <span
              className="hockey-badge club-hq__id-badge"
              data-testid={testId('clubs', 'profile-edit', 'badge', 'id', club.id)}
            >
              ID {club.id}
            </span>
          }
          data-testid={testId('clubs', 'profile-edit', 'text', 'title', club.id)}
        />
        <div className="club-hq__card club-hq__form-card">
          <div className="club-hq__field">
            <label className="club-hq__label" htmlFor={`${fieldId}-name`}>
              Название клуба
            </label>
            <TextInput
              id={`${fieldId}-name`}
              size="l"
              value={name}
              onUpdate={setName}
              data-testid={testId('clubs', 'profile-edit', 'field', 'name', club.id)}
            />
          </div>
          <div className="club-hq__field">
            <label
              className="club-hq__label"
              htmlFor={`${fieldId}-description`}
              data-testid={testId('clubs', 'profile-edit', 'text', 'description-label', club.id)}
            >
              Описание
            </label>
            <TextArea
              id={`${fieldId}-description`}
              size="l"
              value={description}
              onUpdate={setDescription}
              rows={3}
              data-testid={testId('clubs', 'profile-edit', 'field', 'description', club.id)}
            />
          </div>
          <div className="club-hq__form-grid">
            <div className="club-hq__field">
              <label className="club-hq__label" htmlFor={`${fieldId}-email`}>
                Email
              </label>
              <TextInput
                id={`${fieldId}-email`}
                size="l"
                value={contactEmail}
                onUpdate={setContactEmail}
                data-testid={testId('clubs', 'profile-edit', 'field', 'email', club.id)}
              />
            </div>
            <div className="club-hq__field">
              <label className="club-hq__label" htmlFor={`${fieldId}-phone`}>
                Телефон
              </label>
              <TextInput
                id={`${fieldId}-phone`}
                size="l"
                value={contactPhone}
                onUpdate={setContactPhone}
                data-testid={testId('clubs', 'profile-edit', 'field', 'phone', club.id)}
              />
            </div>
          </div>
        </div>
      </section>

      <section
        className="club-hq__section"
        data-testid={testId('clubs', 'profile-edit', 'panel', 'staff', club.id)}
      >
        <SectionHeading
          title="Штаб клуба"
          extra={
            <HockeyButton
              view="outlined"
              size="m"
              onClick={() => setStaff((prev) => [...prev, emptyStaff()])}
              data-testid={testId('clubs', 'profile-edit', 'btn', 'add-staff', club.id)}
            >
              <Icon data={Plus} size={14} />
              Добавить
            </HockeyButton>
          }
          data-testid={testId('clubs', 'profile-edit', 'text', 'staff-title', club.id)}
        />

        <div className="club-hq__card club-hq__staff-editor">
          {staff.map((member, index) => {
            const rowId = `${fieldId}-staff-${index}`
            return (
              <div
                key={member.userId}
                className="club-hq__staff-edit"
                data-testid={testId('clubs', 'profile-edit', 'row', 'staff', member.userId)}
              >
                <div className="club-hq__staff-edit-head">
                  <div className="club-hq__staff-edit-person">
                    <span className="club-hq__avatar" aria-hidden>
                      {member.displayName.trim().charAt(0).toUpperCase() || '?'}
                    </span>
                    <span className="club-hq__staff-name">
                      {member.displayName.trim() || 'Новый сотрудник'}
                    </span>
                    <span
                      className={`club-hq__staff-role${member.role === 'head_coach' ? ' is-lead' : ''}`}
                      data-testid={testId(
                        'clubs',
                        'profile-edit',
                        'text',
                        'staff-role-label',
                        member.userId,
                      )}
                    >
                      {STAFF_ROLE_LABELS[member.role]}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="club-hq__text-action club-hq__text-action--danger"
                    onClick={() => setStaff((prev) => prev.filter((_, i) => i !== index))}
                    data-testid={testId(
                      'clubs',
                      'profile-edit',
                      'btn',
                      'remove-staff',
                      member.userId,
                    )}
                  >
                    Удалить
                  </button>
                </div>
                <div className="club-hq__form-grid">
                  <div className="club-hq__field">
                    <label className="club-hq__label" htmlFor={`${rowId}-name`}>
                      ФИО
                    </label>
                    <TextInput
                      id={`${rowId}-name`}
                      value={member.displayName}
                      onUpdate={(value) => updateStaff(index, {displayName: value})}
                      data-testid={testId(
                        'clubs',
                        'profile-edit',
                        'field',
                        'staff-name',
                        member.userId,
                      )}
                    />
                  </div>
                  <div className="club-hq__field">
                    <label className="club-hq__label" htmlFor={`${rowId}-role`}>
                      Роль в клубе
                    </label>
                    <Select
                      id={`${rowId}-role`}
                      width="max"
                      value={[member.role]}
                      options={STAFF_ROLE_OPTIONS}
                      onUpdate={(value) =>
                        updateStaff(index, {
                          role: (value[0] as ClubStaffMember['role']) ?? 'manager',
                        })
                      }
                      data-testid={testId(
                        'clubs',
                        'profile-edit',
                        'select',
                        'staff-role',
                        member.userId,
                      )}
                    />
                  </div>
                  <div className="club-hq__field">
                    <label className="club-hq__label" htmlFor={`${rowId}-email`}>
                      Email
                    </label>
                    <TextInput
                      id={`${rowId}-email`}
                      value={member.contactEmail ?? ''}
                      onUpdate={(value) => updateStaff(index, {contactEmail: value})}
                      data-testid={testId(
                        'clubs',
                        'profile-edit',
                        'field',
                        'staff-email',
                        member.userId,
                      )}
                    />
                  </div>
                  <div className="club-hq__field">
                    <label className="club-hq__label" htmlFor={`${rowId}-phone`}>
                      Телефон
                    </label>
                    <TextInput
                      id={`${rowId}-phone`}
                      value={member.contactPhone ?? ''}
                      onUpdate={(value) => updateStaff(index, {contactPhone: value})}
                      data-testid={testId(
                        'clubs',
                        'profile-edit',
                        'field',
                        'staff-phone',
                        member.userId,
                      )}
                    />
                  </div>
                </div>
              </div>
            )
          })}

          <HockeyButton
            view="action"
            size="l"
            width="max"
            loading={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
            data-testid={testId('clubs', 'profile-edit', 'btn', 'save', club.id)}
          >
            Сохранить изменения
          </HockeyButton>
          {statusMessage && (
            <p
              className="club-hq__status"
              data-testid={testId('clubs', 'profile-edit', 'text', 'status', club.id)}
            >
              {statusMessage}
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
