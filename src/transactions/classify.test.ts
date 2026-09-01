import { describe, expect, it } from 'vitest'
import { categoryMatchesDescription } from './classify.ts'

describe('categoryMatchesDescription', () => {
  it('matches on any of the semicolon-separated patterns', () => {
    expect(categoryMatchesDescription('coffee;TEST-*', 'TEST-0001')).toBe(true)
    expect(categoryMatchesDescription('coffee;TEST-*', 'Coffee Latte')).toBe(true)
    expect(categoryMatchesDescription('coffee;TEST-*', 'groceries')).toBe(false)
  })

  it('rejects empty matcher and empty patterns', () => {
    expect(categoryMatchesDescription('', 'anything')).toBe(false)
    expect(categoryMatchesDescription('  ', 'anything')).toBe(false)
    expect(categoryMatchesDescription(';;', 'anything')).toBe(false)
  })

  it('matches globs case-insensitively', () => {
    expect(categoryMatchesDescription('test-*', 'TEST-0001')).toBe(true)
  })

  it('matches plain keywords as substring', () => {
    expect(categoryMatchesDescription('coffee', 'Coffeemaker')).toBe(true)
  })
})