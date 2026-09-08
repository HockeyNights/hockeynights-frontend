#!/usr/bin/env node
/**
 * Генерирует реестр data-testid в docs/07-data-testid-reference.md из вызовов
 * `testId(...)` в исходниках фронтенда.
 *
 * Вводная часть документа (формат имени, типы элементов, соглашения) правится
 * руками — скрипт перезаписывает только раздел «Реестр паттернов по доменам».
 *
 * Запуск: node scripts/generate-testid-reference.mjs
 */

import {readdir, readFile, writeFile} from 'node:fs/promises'
import {dirname, join, relative, resolve, sep} from 'node:path'
import {fileURLToPath} from 'node:url'

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE_ROOT = join(REPO_ROOT, 'frontend', 'src')
const DOC_PATH = join(REPO_ROOT, 'docs', '07-data-testid-reference.md')

const REGISTRY_HEADING = '## Реестр паттернов по доменам'
const REGISTRY_INTRO =
  '> Автогенерация из `testId(...)` в исходниках: `node scripts/generate-testid-reference.mjs`.\n' +
  '> Динамические части (`{id}`) — placeholder для runtime-значения.'

/** Тесты и моки не участвуют в реестре: там testId только читается. */
const EXCLUDED_DIRS = new Set(['test', 'mocks', 'node_modules'])
/** Сам хелпер описывает сигнатуру, а не конкретный паттерн. */
const EXCLUDED_FILES = new Set([join('shared', 'testing', 'testId.ts')])
const SOURCE_EXTENSIONS = ['.ts', '.tsx']

async function collectSourceFiles(dir) {
  const entries = await readdir(dir, {withFileTypes: true})
  const files = []

  for (const entry of entries) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) continue
      files.push(...(await collectSourceFiles(path)))
      continue
    }
    if (entry.name.includes('.spec.')) continue
    if (!SOURCE_EXTENSIONS.some((ext) => entry.name.endsWith(ext))) continue
    if (EXCLUDED_FILES.has(relative(SOURCE_ROOT, path))) continue
    files.push(path)
  }

  return files
}

/** Находит закрывающую скобку вызова, пропуская строки и вложенные скобки. */
function findCallEnd(source, openIndex) {
  const pairs = {'(': ')', '[': ']', '{': '}'}
  const stack = [')']
  let index = openIndex

  while (index < source.length) {
    const char = source[index]

    if (char === "'" || char === '"' || char === '`') {
      index += 1
      while (index < source.length && source[index] !== char) {
        index += source[index] === '\\' ? 2 : 1
      }
      index += 1
      continue
    }

    if (pairs[char]) {
      stack.push(pairs[char])
    } else if (char === stack[stack.length - 1]) {
      stack.pop()
      if (stack.length === 0) return index
    }

    index += 1
  }

  return -1
}

function splitTopLevelArgs(argsSource) {
  const args = []
  let depth = 0
  let current = ''
  let index = 0

  while (index < argsSource.length) {
    const char = argsSource[index]

    if (char === "'" || char === '"' || char === '`') {
      let literal = char
      index += 1
      while (index < argsSource.length && argsSource[index] !== char) {
        literal += argsSource[index]
        index += 1
      }
      current += `${literal}${char}`
      index += 1
      continue
    }

    if ('([{'.includes(char)) depth += 1
    if (')]}'.includes(char)) depth -= 1

    if (char === ',' && depth === 0) {
      args.push(current)
      current = ''
      index += 1
      continue
    }

    current += char
    index += 1
  }

  if (current.trim()) args.push(current)
  return args
}

/** Повторяет нормализацию из `src/shared/testing/testId.ts`. */
function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function toKebab(identifier) {
  return slugify(identifier.replace(/([a-z0-9])([A-Z])/g, '$1-$2'))
}

const EXPRESSION_NOISE = new Set([
  'undefined',
  'null',
  'true',
  'false',
  'String',
  'Number',
  'Boolean',
])

/** Подбирает читаемое имя placeholder-а для нелитерального аргумента. */
function placeholderFor(expression) {
  const withoutStrings = expression.replace(/'[^']*'|"[^"]*"|`[^`]*`/g, ' ').trim()

  const member = withoutStrings.match(/^([A-Za-z_$][\w$]*)\.([A-Za-z_$][\w$]*)/)
  if (member) {
    const [, object, property] = member
    return toKebab(property === 'id' ? `${object}Id` : property)
  }

  const identifiers = withoutStrings.match(/[A-Za-z_$][\w$]*/g) ?? []
  const picked = identifiers.find((id) => !EXPRESSION_NOISE.has(id)) ?? 'value'
  return toKebab(picked)
}

function normalizeArg(rawArg) {
  const arg = rawArg.trim()

  const quoted = arg.match(/^'([^']*)'$/) ?? arg.match(/^"([^"]*)"$/)
  if (quoted) return slugify(quoted[1])

  const template = arg.match(/^`([^`]*)`$/)
  if (template && !template[1].includes('${')) return slugify(template[1])

  return `{${placeholderFor(arg)}}`
}

function extractPatterns(source) {
  const patterns = []
  const callStart = /\btestId\s*\(/g
  let match

  while ((match = callStart.exec(source))) {
    const openIndex = match.index + match[0].length
    const endIndex = findCallEnd(source, openIndex)
    if (endIndex === -1) continue

    const args = splitTopLevelArgs(source.slice(openIndex, endIndex))
    const parts = args.map(normalizeArg).filter(Boolean)
    if (parts.length === 0) continue

    patterns.push(parts.join('-'))
    callStart.lastIndex = endIndex
  }

  return patterns
}

function renderTable(rows) {
  const patternHeader = 'Паттерн testId'
  const fileHeader = 'Файл'
  const patternWidth = Math.max(patternHeader.length, ...rows.map(([p]) => p.length + 2))
  const fileWidth = Math.max(fileHeader.length, ...rows.map(([, f]) => f.length + 2))

  const lines = [
    `| ${patternHeader.padEnd(patternWidth)} | ${fileHeader.padEnd(fileWidth)} |`,
    `|${'-'.repeat(patternWidth + 2)}|${'-'.repeat(fileWidth + 2)}|`,
  ]

  for (const [pattern, file] of rows) {
    lines.push(`| ${`\`${pattern}\``.padEnd(patternWidth)} | ${`\`${file}\``.padEnd(fileWidth)} |`)
  }

  return lines.join('\n')
}

async function main() {
  const files = await collectSourceFiles(SOURCE_ROOT)
  /** @type {Map<string, Map<string, Set<string>>>} scope → pattern → files */
  const registry = new Map()
  const touchedFiles = new Set()

  for (const file of files) {
    const source = await readFile(file, 'utf8')
    const patterns = extractPatterns(source)
    if (patterns.length === 0) continue

    const relativePath = relative(join(REPO_ROOT, 'frontend'), file).split(sep).join('/')
    touchedFiles.add(relativePath)

    for (const pattern of patterns) {
      const scope = pattern.startsWith('{')
        ? pattern.slice(0, pattern.indexOf('}') + 1)
        : pattern.split('-')[0]

      if (!registry.has(scope)) registry.set(scope, new Map())
      const scopePatterns = registry.get(scope)
      if (!scopePatterns.has(pattern)) scopePatterns.set(pattern, new Set())
      scopePatterns.get(pattern).add(relativePath)
    }
  }

  const collator = new Intl.Collator('en')
  const scopes = [...registry.keys()].sort((a, b) => {
    // Скоупы-placeholder (shared-компоненты с testIdPrefix) — в конец.
    const aDynamic = a.startsWith('{')
    const bDynamic = b.startsWith('{')
    if (aDynamic !== bDynamic) return aDynamic ? 1 : -1
    return collator.compare(a, b)
  })

  const sections = []
  let uniquePatterns = 0

  for (const scope of scopes) {
    const scopePatterns = registry.get(scope)
    const rows = [...scopePatterns.entries()]
      .sort(([a], [b]) => collator.compare(a, b))
      .map(([pattern, patternFiles]) => [pattern, [...patternFiles].sort(collator.compare).join(', ')])

    uniquePatterns += rows.length
    sections.push(`### ${scope}\n\n${renderTable(rows)}`)
  }

  const doc = await readFile(DOC_PATH, 'utf8')
  const headingIndex = doc.indexOf(REGISTRY_HEADING)
  if (headingIndex === -1) {
    throw new Error(`В ${DOC_PATH} не найден заголовок «${REGISTRY_HEADING}»`)
  }

  const registrySection = [
    REGISTRY_HEADING,
    '',
    REGISTRY_INTRO,
    '',
    sections.join('\n\n'),
    '',
    '---',
    '',
    `*Сгенерировано · ${uniquePatterns} уникальных паттернов · ${touchedFiles.size} файлов*`,
    '',
  ].join('\n')

  await writeFile(DOC_PATH, `${doc.slice(0, headingIndex)}${registrySection}`, 'utf8')

  process.stdout.write(
    `docs/07-data-testid-reference.md: ${uniquePatterns} паттернов из ${touchedFiles.size} файлов\n`,
  )
}

await main()
