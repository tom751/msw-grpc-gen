import fg from 'fast-glob'
import fs from 'fs'
import { generate } from './build/generate'
import { getFilename } from './utils/files'

const fileGlob = process.argv[2]
if (!fileGlob) {
  throw new Error('Missing file glob argument')
}

const serviceFiles = fg.sync(fileGlob)
if (serviceFiles.length === 0) {
  console.log('No files found')
  process.exit()
}

for (const service of serviceFiles) {
  const output = generate(service)
  if (!output) {
    continue
  }

  // TODO - configure this
  const mockFilename = `${getFilename(service)}.ts`
  const outputDir = `../example/${mockFilename}`
  fs.writeFileSync(outputDir, output)
}
