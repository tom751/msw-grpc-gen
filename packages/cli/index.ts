import { program } from 'commander'
import fg from 'fast-glob'
import fs from 'fs'
import path from 'path'
import { generateHandlers } from './build/handlers'
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

const clientFiles = fg.sync(program.args[0])
if (clientFiles.length === 0) {
  console.log('No files found')
  process.exit()
}

interface Options {
  out: string
}

const options = program.opts<Options>()
for (const file of clientFiles) {
  const output = generateHandlers(file)
  if (!output) {
    continue
  }

  const mockFilename = `${getFilename(file)}.ts`
  const outputDir = path.join(__dirname, options.out, mockFilename)

  fs.writeFileSync(outputDir, output)
}
