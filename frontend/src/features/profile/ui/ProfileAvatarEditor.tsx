/**
 * Загрузка и обрезка аватарки профиля (квадратный кадр → data URL).
 * Сдвиг по X/Y + зум, превью совпадает с canvas.
 */

import {Dialog, Slider, Text} from '@gravity-ui/uikit'
import {type PointerEvent as ReactPointerEvent, useEffect, useId, useRef, useState} from 'react'

import {getProfileInitials} from '@/shared/lib/profileIdentity'
import {testId} from '@/shared/testing/testId'
import {HockeyButton} from '@/shared/ui/HockeyButton'

const OUTPUT_SIZE = 512
const MIN_ZOOM = 1
const MAX_ZOOM = 3

export interface ProfileAvatarEditorProps {
  avatarUrl?: string
  displayName: string
  onChange: (avatarUrl: string | undefined) => void
  onEditorOpenChange?: (open: boolean) => void
}

interface ImageSize {
  width: number
  height: number
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Не удалось загрузить изображение'))
    image.src = src
  })
}

/** Cover-layout: размер отрисовки и максимальный сдвиг в пикселях кадра. */
function coverMetrics(image: ImageSize, boxSize: number, zoom: number) {
  const scale = Math.max(boxSize / image.width, boxSize / image.height) * zoom
  const drawWidth = image.width * scale
  const drawHeight = image.height * scale
  const maxOffsetX = Math.max(0, (drawWidth - boxSize) / 2)
  const maxOffsetY = Math.max(0, (drawHeight - boxSize) / 2)
  return {drawWidth, drawHeight, maxOffsetX, maxOffsetY}
}

function clampUnit(value: number) {
  return Math.max(-1, Math.min(1, value))
}

async function cropToDataUrl(
  sourceUrl: string,
  zoom: number,
  offsetX: number,
  offsetY: number,
): Promise<string> {
  const image = await loadImage(sourceUrl)
  const canvas = document.createElement('canvas')
  canvas.width = OUTPUT_SIZE
  canvas.height = OUTPUT_SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas недоступен')

  const {drawWidth, drawHeight, maxOffsetX, maxOffsetY} = coverMetrics(
    {width: image.width, height: image.height},
    OUTPUT_SIZE,
    zoom,
  )
  const ox = maxOffsetX > 0 ? clampUnit(offsetX) : 0
  const oy = maxOffsetY > 0 ? clampUnit(offsetY) : 0
  const dx = (OUTPUT_SIZE - drawWidth) / 2 + ox * maxOffsetX
  const dy = (OUTPUT_SIZE - drawHeight) / 2 + oy * maxOffsetY

  ctx.fillStyle = '#0f2a40'
  ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE)
  ctx.drawImage(image, dx, dy, drawWidth, drawHeight)
  return canvas.toDataURL('image/jpeg', 0.92)
}

export function ProfileAvatarEditor({
  avatarUrl,
  displayName,
  onChange,
  onEditorOpenChange,
}: ProfileAvatarEditorProps) {
  const fileInputId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [sourceUrl, setSourceUrl] = useState<string | null>(null)
  const [imageSize, setImageSize] = useState<ImageSize | null>(null)
  const [stageSize, setStageSize] = useState(360)
  const [zoom, setZoom] = useState(1.2)
  const [offset, setOffset] = useState({x: 0, y: 0})
  const [dragging, setDragging] = useState(false)
  const dragOrigin = useRef<{x: number; y: number; ox: number; oy: number} | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initials = getProfileInitials(displayName)

  useEffect(() => {
    onEditorOpenChange?.(editorOpen)
  }, [editorOpen, onEditorOpenChange])

  useEffect(() => {
    return () => {
      if (sourceUrl?.startsWith('blob:')) URL.revokeObjectURL(sourceUrl)
    }
  }, [sourceUrl])

  useEffect(() => {
    if (!sourceUrl) return
    let cancelled = false
    void loadImage(sourceUrl)
      .then((image) => {
        if (!cancelled) setImageSize({width: image.naturalWidth, height: image.naturalHeight})
      })
      .catch(() => {
        if (!cancelled) setError('Не удалось загрузить изображение')
      })
    return () => {
      cancelled = true
    }
  }, [sourceUrl])

  useEffect(() => {
    if (!editorOpen || !stageRef.current) return
    const node = stageRef.current
    const sync = () => setStageSize(node.clientWidth || 360)
    sync()
    const observer = new ResizeObserver(sync)
    observer.observe(node)
    return () => observer.disconnect()
  }, [editorOpen, sourceUrl])

  const previewLayout =
    imageSize && stageSize > 0
      ? (() => {
          const metrics = coverMetrics(imageSize, stageSize, zoom)
          const ox = metrics.maxOffsetX > 0 ? clampUnit(offset.x) : 0
          const oy = metrics.maxOffsetY > 0 ? clampUnit(offset.y) : 0
          return {
            width: metrics.drawWidth,
            height: metrics.drawHeight,
            left: (stageSize - metrics.drawWidth) / 2 + ox * metrics.maxOffsetX,
            top: (stageSize - metrics.drawHeight) / 2 + oy * metrics.maxOffsetY,
            maxOffsetX: metrics.maxOffsetX,
            maxOffsetY: metrics.maxOffsetY,
          }
        })()
      : null

  function openFilePicker() {
    fileInputRef.current?.click()
  }

  function handleFileChange(fileList: FileList | null) {
    const file = fileList?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Выберите файл изображения')
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('Файл больше 8 МБ')
      return
    }
    setError(null)
    if (sourceUrl?.startsWith('blob:')) URL.revokeObjectURL(sourceUrl)
    const nextUrl = URL.createObjectURL(file)
    setSourceUrl(nextUrl)
    setImageSize(null)
    setZoom(1.2)
    setOffset({x: 0, y: 0})
    setEditorOpen(true)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function closeEditor() {
    if (isSaving) return
    setEditorOpen(false)
    setDragging(false)
    dragOrigin.current = null
    if (sourceUrl?.startsWith('blob:')) URL.revokeObjectURL(sourceUrl)
    setSourceUrl(null)
    setImageSize(null)
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(true)
    dragOrigin.current = {x: event.clientX, y: event.clientY, ox: offset.x, oy: offset.y}
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging || !dragOrigin.current || !previewLayout) return
    const {maxOffsetX, maxOffsetY} = previewLayout
    const dxPx = event.clientX - dragOrigin.current.x
    const dyPx = event.clientY - dragOrigin.current.y
    setOffset({
      x: maxOffsetX > 0 ? clampUnit(dragOrigin.current.ox + dxPx / maxOffsetX) : 0,
      y: maxOffsetY > 0 ? clampUnit(dragOrigin.current.oy + dyPx / maxOffsetY) : 0,
    })
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    setDragging(false)
    dragOrigin.current = null
  }

  async function applyCrop() {
    if (!sourceUrl) return
    const cropSource = sourceUrl
    setIsSaving(true)
    setError(null)
    try {
      const next = await cropToDataUrl(cropSource, zoom, offset.x, offset.y)
      onChange(next)
      setEditorOpen(false)
      setDragging(false)
      dragOrigin.current = null
      if (cropSource.startsWith('blob:')) URL.revokeObjectURL(cropSource)
      setSourceUrl(null)
      setImageSize(null)
    } catch {
      setError('Не удалось обрезать изображение')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      className="profile-avatar-editor"
      data-testid={testId('profile', 'avatar-editor', 'panel')}
    >
      <div className="profile-avatar-editor__preview-row">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="profile-avatar-editor__preview"
            data-testid={testId('profile', 'avatar-editor', 'img', 'preview')}
          />
        ) : (
          <span
            className="profile-avatar-editor__preview profile-avatar-editor__preview--empty"
            aria-hidden
            lang="ru"
            data-testid={testId('profile', 'avatar-editor', 'icon', 'preview')}
          >
            {initials}
          </span>
        )}
        <div className="profile-avatar-editor__actions">
          <Text color="secondary" data-testid={testId('profile', 'avatar-editor', 'text', 'hint')}>
            Квадратный кадр, до 8 МБ. Можно сдвинуть фото по горизонтали и вертикали.
          </Text>
          <div className="profile-avatar-editor__buttons">
            <HockeyButton
              view="outlined"
              className="profile-avatar-editor__btn"
              onClick={openFilePicker}
              data-testid={testId('profile', 'avatar-editor', 'btn', 'upload')}
            >
              Загрузить фото
            </HockeyButton>
            {avatarUrl ? (
              <HockeyButton
                view="outlined"
                className="profile-avatar-editor__btn profile-avatar-editor__btn--danger"
                onClick={() => onChange(undefined)}
                data-testid={testId('profile', 'avatar-editor', 'btn', 'remove')}
              >
                Удалить
              </HockeyButton>
            ) : null}
          </div>
          {error && !editorOpen && (
            <Text color="danger" data-testid={testId('profile', 'avatar-editor', 'text', 'error')}>
              {error}
            </Text>
          )}
        </div>
      </div>

      <input
        id={fileInputId}
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => handleFileChange(event.target.files)}
        data-testid={testId('profile', 'avatar-editor', 'field', 'file')}
      />

      <Dialog
        open={editorOpen}
        onClose={closeEditor}
        size="m"
        className="profile-hub__edit-dialog"
        modalClassName="profile-hub__edit-dialog-modal"
        data-testid={testId('profile', 'avatar-editor', 'dialog')}
      >
        <Dialog.Header
          caption="Редактор аватарки"
          data-testid={testId('profile', 'avatar-editor', 'text', 'dialog-title')}
        />
        <Dialog.Body>
          <div className="profile-avatar-editor__dialog-body">
            <div
              ref={stageRef}
              className={`profile-avatar-editor__stage${dragging ? ' is-dragging' : ''}`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              data-testid={testId('profile', 'avatar-editor', 'panel', 'stage')}
            >
              {sourceUrl && previewLayout && (
                <img
                  src={sourceUrl}
                  alt=""
                  className="profile-avatar-editor__stage-image"
                  style={{
                    width: previewLayout.width,
                    height: previewLayout.height,
                    left: previewLayout.left,
                    top: previewLayout.top,
                  }}
                  draggable={false}
                />
              )}
              <div className="profile-avatar-editor__frame" aria-hidden />
            </div>
            <div
              className="profile-avatar-editor__zoom"
              data-testid={testId('profile', 'avatar-editor', 'panel', 'zoom')}
            >
              <Text color="secondary">Масштаб</Text>
              <Slider
                min={MIN_ZOOM}
                max={MAX_ZOOM}
                step={0.05}
                value={zoom}
                onUpdate={(value) => {
                  const nextZoom = typeof value === 'number' ? value : value[0]
                  setZoom(nextZoom)
                  setOffset((prev) => {
                    if (!imageSize) return prev
                    const metrics = coverMetrics(imageSize, stageSize, nextZoom)
                    return {
                      x: metrics.maxOffsetX > 0 ? clampUnit(prev.x) : 0,
                      y: metrics.maxOffsetY > 0 ? clampUnit(prev.y) : 0,
                    }
                  })
                }}
                data-testid={testId('profile', 'avatar-editor', 'slider', 'zoom')}
              />
            </div>
            {error && (
              <Text
                color="danger"
                data-testid={testId('profile', 'avatar-editor', 'text', 'crop-error')}
              >
                {error}
              </Text>
            )}
          </div>
        </Dialog.Body>
        <Dialog.Footer data-testid={testId('profile', 'avatar-editor', 'footer')}>
          <HockeyButton
            view="outlined"
            disabled={isSaving}
            onClick={closeEditor}
            data-testid={testId('profile', 'avatar-editor', 'btn', 'cancel')}
          >
            Отмена
          </HockeyButton>
          <HockeyButton
            view="action"
            loading={isSaving}
            onClick={() => {
              void applyCrop()
            }}
            data-testid={testId('profile', 'avatar-editor', 'btn', 'apply')}
          >
            Применить
          </HockeyButton>
        </Dialog.Footer>
      </Dialog>
    </div>
  )
}
