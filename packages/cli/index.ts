import { program } from 'commander'
import run from './run'
import type { Options } from './types'

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

const files = program.args
if (files.length === 0) {
  console.log('No files found')
  process.exit()
}

const options = program.opts<Options>()

run(options, files)
