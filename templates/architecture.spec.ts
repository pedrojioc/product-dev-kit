/**
 * Architecture guardrails — installed from the pdk template.
 *
 * These are the rules no prompt can enforce, so they fail the build instead:
 *   1. a context never imports another context
 *   2. `shared/` never depends on a context
 *   3. `domain/` and `application/` never import a framework, ORM, HTTP client or env
 *   4. the core never imports an adapter layer
 *   5. a sibling module's `domain/` is never imported directly
 *   6. no spec file lives under `src/`
 *
 * Vitest without `globals: true`: add `import { describe, expect, it } from 'vitest'`.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'

/** Source root. In a monorepo, point this at the app: 'apps/api/src'. */
const SRC = resolve(process.cwd(), 'src')

/** What the core must never reach for. Extend per project; never shorten. */
const OUTSIDE_WORLD = [
  '@nestjs/', 'express', 'fastify', '@fastify/', 'typeorm', 'drizzle-orm', 'prisma',
  '@prisma/', 'mongoose', 'sequelize', 'knex', 'pg', 'mysql2', 'redis', 'ioredis',
  'axios', 'node-fetch', 'got', 'class-validator', 'class-transformer', 'dotenv',
  '@aws-sdk/', 'nodemailer', 'bullmq', 'kafkajs', 'amqplib',
  'node:fs', 'node:http', 'node:https', 'node:net', 'node:child_process',
]

const CORE_LAYERS = ['domain', 'application']
const ADAPTER_LAYERS = ['infrastructure', 'interface']
const ALL_LAYERS = [...CORE_LAYERS, ...ADAPTER_LAYERS]

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) return sourceFiles(full)
    return entry.isFile() && entry.name.endsWith('.ts') ? [full] : []
  })
}

function specifiersOf(file: string): string[] {
  const code = readFileSync(file, 'utf8')
  const patterns = [
    /\bfrom\s*['"]([^'"]+)['"]/g, // import x from 'y', export … from 'y'
    /(?:^|[\n;])\s*import\s*['"]([^'"]+)['"]/g, // side-effect import 'y'
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g, // dynamic import('y')
  ]
  return patterns.flatMap((re) => [...code.matchAll(re)].map((m) => m[1]))
}

const segmentsOf = (absPath: string): string[] => relative(SRC, absPath).split(sep)
const isShared = (segs: string[]): boolean => segs[0] === 'shared'

function at(segs: string[], offset: number): string | null {
  const i = segs.indexOf('contexts')
  return i >= 0 ? (segs[i + offset] ?? null) : null
}
const contextOf = (segs: string[]): string | null => at(segs, 1)
const moduleOf = (segs: string[]): string | null => at(segs, 2)
const layerOf = (segs: string[]): string | null =>
  segs.find((s) => ALL_LAYERS.includes(s)) ?? null

/** Resolve a relative specifier to a path under SRC; null for a bare package. */
const resolveLocal = (file: string, spec: string): string | null =>
  spec.startsWith('.') ? resolve(dirname(file), spec) : null

const files = sourceFiles(SRC)
const show = (f: string) => relative(SRC, f)

/** Every (file, local import target) pair in the tree. */
function localEdges(): Array<{ file: string; spec: string; target: string }> {
  return files.flatMap((file) =>
    specifiersOf(file).flatMap((spec) => {
      const target = resolveLocal(file, spec)
      return target ? [{ file, spec, target }] : []
    }),
  )
}

describe('architecture', () => {
  it('finds source files to check', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  it('never imports across contexts', () => {
    const violations = localEdges()
      .filter(({ file, target }) => {
        const from = contextOf(segmentsOf(file))
        const to = contextOf(segmentsOf(target))
        return from !== null && to !== null && to !== from
      })
      .map(({ file, spec, target }) =>
        `${show(file)} -> ${spec} (${contextOf(segmentsOf(file))} -> ${contextOf(segmentsOf(target))})`,
      )
    expect(violations).toEqual([])
  })

  it('keeps shared/ independent of every context', () => {
    const violations = localEdges()
      .filter(({ file, target }) => isShared(segmentsOf(file)) && contextOf(segmentsOf(target)))
      .map(({ file, spec }) => `${show(file)} -> ${spec}`)
    expect(violations).toEqual([])
  })

  it('keeps the core free of frameworks, ORMs, HTTP clients and env', () => {
    const violations = files
      .filter((file) => CORE_LAYERS.includes(layerOf(segmentsOf(file)) ?? ''))
      .flatMap((file) =>
        specifiersOf(file)
          .filter((spec) => OUTSIDE_WORLD.some((p) => spec === p || spec.startsWith(p)))
          .map((spec) => `${show(file)} -> ${spec}`),
      )
    expect(violations).toEqual([])
  })

  it('never lets the core import an adapter layer', () => {
    const violations = localEdges()
      .filter(({ file, target }) => {
        if (!CORE_LAYERS.includes(layerOf(segmentsOf(file)) ?? '')) return false
        return ADAPTER_LAYERS.includes(layerOf(segmentsOf(target)) ?? '')
      })
      .map(({ file, spec, target }) => `${show(file)} -> ${spec} (${layerOf(segmentsOf(target))})`)
    expect(violations).toEqual([])
  })

  it("never imports a sibling module's domain directly", () => {
    const violations = localEdges()
      .filter(({ file, target }) => {
        const f = segmentsOf(file)
        const t = segmentsOf(target)
        const sameContext = contextOf(f) !== null && contextOf(f) === contextOf(t)
        const other = moduleOf(t)
        // `contexts/<ctx>/shared/` is the context's own vocabulary: always allowed.
        return sameContext && other !== null && other !== 'shared' && other !== moduleOf(f) && layerOf(t) === 'domain'
      })
      .map(({ file, spec, target }) => `${show(file)} -> ${spec} (module ${moduleOf(segmentsOf(file))} -> ${moduleOf(segmentsOf(target))})`)
    expect(violations).toEqual([])
  })

  it('keeps every spec out of src/', () => {
    const inside = files.filter((f) => f.endsWith('.spec.ts')).map(show)
    expect(inside).toEqual([])
  })
})
