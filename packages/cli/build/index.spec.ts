import ts from 'typescript'
import { describe, expect, it } from 'vitest'
import { generateHandlers } from '.'

describe('build', () => {
  describe('generateHandlers', () => {
    it('generates handlers correctly', async () => {
      const file = '../example/pb/example.client.ts'
      const tsOpts: ts.CompilerOptions = {
        target: ts.ScriptTarget.ESNext,
      }
      const host = ts.createCompilerHost(tsOpts, true)
      const prog = ts.createProgram([file], tsOpts, host)

      const result = generateHandlers(file, '../example/src/mocks/gen', prog)
      await expect(result).toMatchFileSnapshot('./snapshots/generateHandlers.snapshot.ts')
    })
  })
})
