import { describe, expect, it } from 'vitest'
import { descriptionMatches } from './descriptionMatches.ts'

describe('descriptionMatches', () => {
  it('matches plain keywords case-insensitively', () => {
    expect(descriptionMatches('Coffee Latte', 'coffee')).toBe(true)
    expect(descriptionMatches('Coffee Latte', 'LATTE')).toBe(true)
    expect(descriptionMatches('Coffee Latte', 'tea')).toBe(false)
  })

  it('matches glob patterns', () => {
    expect(descriptionMatches('TEST-0001', 'TEST-*')).toBe(true)
    expect(descriptionMatches('TEST-9999', 'TEST-*')).toBe(true)
    expect(descriptionMatches('other-0001', 'TEST-*')).toBe(false)
    expect(descriptionMatches('TEST-a', 'TEST-?')).toBe(true)
    expect(descriptionMatches('TEST-ab', 'TEST-?')).toBe(false)
  })

  it('matches globs case-insensitively', () => {
    expect(descriptionMatches('test-0001', 'TEST-*')).toBe(true)
  })
})