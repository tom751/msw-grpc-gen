import ts from 'typescript'
import { generateHandlers, generateIndexFile } from '.'

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

describe('generateIndexFile', () => {
  it('generates index.ts correctly', async () => {
    const createdFiles = ['example', 'test', 'hey']
    const result = generateIndexFile(createdFiles)
    expect(result).toMatchFileSnapshot('./snapshots/generateIndexFile.snapshot.ts')
  })
})
