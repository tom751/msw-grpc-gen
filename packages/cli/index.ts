import { program } from 'commander'
import fs from 'fs'
import path from 'path'
import ts from 'typescript'
import { generateHandlers, generateIndexFile, getHelpersFile } from './build'
import { getFilename } from './utils/files'

program
  .name('msw-grpc-gen')
  .description('Generate MSW handlers from protobuf-ts generated client endpoints')
  .argument('path to client', 'path or glob to protobuf-ts generated clients')
  .requiredOption('-o, --out <string>', 'path to output generated msw handlers')
  .option('-b, --base-url <string>', 'the base url for the handler paths', '')
  .parse()

if (program.args.length < 1) {
  console.log('No path to client specified')
  process.exit(1)
}

const clientFiles = program.args
if (clientFiles.length === 0) {
  console.log('No files found')
  process.exit()
}

interface Options {
  out: string
  baseUrl: string
}

const options = program.opts<Options>()
const out = path.resolve(options.out)
const baseOutDir = path.join(__dirname, options.out)

const tsOpts: ts.CompilerOptions = {
  target: ts.ScriptTarget.ESNext,
}
const host = ts.createCompilerHost(tsOpts, true)
const prog = ts.createProgram(clientFiles, tsOpts, host)

const createdFiles: string[] = []

for (const filepath of clientFiles) {
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
