import { program } from 'commander'
import fs from 'fs'
import path from 'path'
import ts from 'typescript'
import { generateHandlers } from './build'
import { getFilename } from './utils/files'

program
  .name('msw-grpc-gen')
  .description('Generate MSW handlers from protobuf-ts generated client endpoints')
  .argument('path to client', 'path or glob to protobuf-ts generated clients')
  .requiredOption('-o, --out <string>', 'path to output generated msw handlers')
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
}

const options = program.opts<Options>()
const out = path.resolve(options.out)

const tsOpts: ts.CompilerOptions = {
  target: ts.ScriptTarget.ESNext,
}
const host = ts.createCompilerHost(tsOpts, true)
const prog = ts.createProgram(clientFiles, tsOpts, host)

for (const file of clientFiles) {
  const output = generateHandlers(file, out, prog)
  if (!output) {
    continue
  }

  const fileName = getFilename(file)
  const mockFilename = `${fileName}.ts`
  const outputDir = path.join(__dirname, options.out, mockFilename)

  fs.writeFileSync(outputDir, output)
}
