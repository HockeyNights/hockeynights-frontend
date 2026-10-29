import {Button, Checkbox, Dialog, Text} from '@gravity-ui/uikit'
import {useCallback, useState} from 'react'
import {Link} from 'react-router'

import {FAVORITE_ACTIONS_PRESET, getFavoriteIds, setFavoriteIds} from '@/features/favorites/model'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'
import {IceCard} from '@/shared/ui/IceCard'
import {ScoreboardText} from '@/shared/ui/ScoreboardText'

export function FavoritesPanel() {
  const [selectedIds, setSelectedIds] = useState<string[]>(getFavoriteIds)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [draftIds, setDraftIds] = useState<string[]>(selectedIds)

  const selectedActions = FAVORITE_ACTIONS_PRESET.filter((a) => selectedIds.includes(a.id))

  const handleOpenSettings = useCallback(() => {
    setDraftIds([...selectedIds])
    setSettingsOpen(true)
  }, [selectedIds])

  const handleToggleDraft = useCallback((id: string) => {
    setDraftIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }, [])

  const handleSave = useCallback(() => {
    const next = setFavoriteIds(draftIds)
    setSelectedIds(next)
    setSettingsOpen(false)
  }, [draftIds])

  const handleClose = useCallback(() => {
    setSettingsOpen(false)
  }, [])

  return (
    <IceCard padding="s" data-testid={testId('favorites', 'panel')}>
      <div className="side-board__head">
        <div className="side-board__title" data-testid={testId('favorites', 'text', 'title')}>
          Быстрые действия
        </div>
        <Button
          view="flat"
          size="xs"
          onClick={handleOpenSettings}
          data-testid={testId('favorites', 'btn', 'settings')}
        >
          Настроить
        </Button>
      </div>

      {selectedActions.length === 0 ? (
        <Text color="secondary" data-testid={testId('favorites', 'empty')}>
          Добавьте быстрые действия
        </Text>
      ) : (
        <div className="hockey-stack hockey-stack--gap-6 hockey-mt-8">
          {selectedActions.map((action) => (
            <Link
              key={action.id}
              to={action.route}
              data-testid={testId('favorites', 'link', action.id)}
            >
              <div
                className="side-board__item favorites-item"
                data-testid={testId('favorites', 'card', action.id)}
              >
                <div className="hockey-row hockey-row--align-center hockey-row--gap-8">
                  <ScoreboardText data-testid={testId('favorites', 'icon', action.id)}>
                    {action.icon}
                  </ScoreboardText>
                  <div className="hockey-stack">
                    <Text
                      variant="subheader-3"
                      data-testid={testId('favorites', 'label', action.id)}
                    >
                      {action.label}
                    </Text>
                    <Text
                      color="secondary"
                      variant="caption-1"
                      data-testid={testId('favorites', 'desc', action.id)}
                    >
                      {action.description}
                    </Text>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Dialog
        open={settingsOpen}
        onClose={handleClose}
        size="s"
        data-testid={testId('favorites', 'settings', 'dialog')}
      >
        <Dialog.Header
          caption="Настроить избранное"
          data-testid={testId('favorites', 'settings', 'header')}
        />
        <Dialog.Body>
          <div className="hockey-stack hockey-stack--gap-8">
            {FAVORITE_ACTIONS_PRESET.map((action) => (
              <div
                key={action.id}
                className="hockey-row hockey-row--align-center hockey-row--gap-8"
                data-testid={testId('favorites', 'settings', 'row', action.id)}
              >
                <Checkbox
                  checked={draftIds.includes(action.id)}
                  onUpdate={() => handleToggleDraft(action.id)}
                  data-testid={testId('favorites', 'settings', 'checkbox', action.id)}
                />
                <Text data-testid={testId('favorites', 'settings', 'icon', action.id)}>
                  {action.icon}
                </Text>
                <div className="hockey-stack">
                  <Text data-testid={testId('favorites', 'settings', 'label', action.id)}>
                    {action.label}
                  </Text>
                  <Text
                    color="secondary"
                    variant="caption-1"
                    data-testid={testId('favorites', 'settings', 'desc', action.id)}
                  >
                    {action.description}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </Dialog.Body>
        <Dialog.Footer data-testid={testId('favorites', 'settings', 'footer')}>
          <HockeyButton
            view="outlined"
            size="s"
            onClick={handleClose}
            data-testid={testId('favorites', 'settings', 'btn', 'cancel')}
          >
            Отмена
          </HockeyButton>
          <HockeyButton
            size="s"
            onClick={handleSave}
            data-testid={testId('favorites', 'settings', 'btn', 'save')}
          >
            Сохранить
          </HockeyButton>
        </Dialog.Footer>
      </Dialog>
    </IceCard>
  )
}
