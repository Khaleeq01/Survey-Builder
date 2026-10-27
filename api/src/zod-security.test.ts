/**
 * Security regression test for GHSA-mrhx-c7xc-m3w5 (zod < 4.6.6).
 * Run with: node api/src/zod-security.test.ts
 *
 * Verifies that every zod resolution recorded in pnpm-lock.yaml is the
 * patched version (>= 4.6.6). This guards against reintroducing a
 * vulnerable zod version into the dependency tree.
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const lockfilePath = join(here, '..', '..', 'pnpm-lock.yaml')

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`)
  }
  console.log(`✓ ${message}`)
}

function parseVersion(version: string): number[] {
  return version.split('.').map(Number)
}

function gte(a: string, b: string): boolean {
  const aa = parseVersion(a)
  const bb = parseVersion(b)
  for (let i = 0; i < 3; i++) {
    if ((aa[i] ?? 0) > (bb[i] ?? 0)) return true
    if ((aa[i] ?? 0) < (bb[i] ?? 0)) return false
  }
  return true
}

const lockfile = readFileSync(lockfilePath, 'utf8')
const zodVersions = [...lockfile.matchAll(/^ {2}zod@(\d+\.\d+\.\d+):/gm)].map(
  (match) => match[1],
)

assert(zodVersions.length > 0, 'lockfile pins a zod version')

for (const version of zodVersions) {
  assert(
    gte(version, '4.6.6'),
    `zod@${version} must be >= 4.6.6 (GHSA-mrhx-c7xc-m3w5)`,
  )
}

console.log('\n✅ All zod resolutions are patched against GHSA-mrhx-c7xc-m3w5')
