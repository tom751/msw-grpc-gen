import { describe, expect, it } from 'vitest'
import { getFilename } from './files'

describe('files', () => {
  describe('getFilename', () => {
    it('returns the name of a file without the extension', () => {
      const input = 'test/something/hey.ts'
      expect(getFilename(input)).toBe('hey')
    })

    it('returns the first part of the filename if it contains multiple dots', () => {
      const input = 'test/something/hey.there.ts'
      expect(getFilename(input)).toBe('hey')
    })
  })
})
