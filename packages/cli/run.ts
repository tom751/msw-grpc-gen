import fs from 'fs'
import { generateHandlers, generateIndexFile, getHelpersFile } from 'generator/build'
import { getFilename } from 'generator/utils/files'
import path from 'path'
import ts from 'typescript'
import type { Options } from './types'

export default function run(options: Options, files: string[]) {
  const out = path.resolve(options.out)
  const baseOutDir = path.join(__dirname, options.out)

  const tsOpts: ts.CompilerOptions = {
    target: ts.ScriptTarget.ESNext,
  }
  const host = ts.createCompilerHost(tsOpts, true)
  const prog = ts.createProgram(files, tsOpts, host)

  const createdFiles: string[] = []

  for (const filepath of files) {
    const output = generateHandlers({ filepath, outDirPath: out, prog, baseUrl: options.baseUrl })
    if (!output) {
      continue
    }

    const fileName = getFilename(filepath)
    const mockFilename = `${fileName}.ts`
    const outputDir = path.join(baseOutDir, mockFilename)

    fs.writeFileSync(outputDir, output)
    createdFiles.push(fileName)
  }

  if (createdFiles.length > 0) {
    const indexFile = generateIndexFile(createdFiles)
    const indexOutputDir = path.join(baseOutDir, 'index.ts')
    fs.writeFileSync(indexOutputDir, indexFile)

    const helpersFile = getHelpersFile()
    const helpersOutputDir = path.join(baseOutDir, 'helpers.ts')
    fs.writeFileSync(helpersOutputDir, helpersFile)
  }
}
