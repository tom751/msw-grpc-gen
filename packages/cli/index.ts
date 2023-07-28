import fg from 'fast-glob'
import fs from 'fs'
import ts from 'typescript'
import { build } from './build'
import { getFilename } from './files'
import { findClientInterface, getServiceEndpoints } from './parse'

const fileGlob = process.argv[2]
if (!fileGlob) {
  throw new Error('Missing file glob argument')
}

const serviceFiles = fg.sync(fileGlob)
if (serviceFiles.length === 0) {
  console.log('No files found')
  process.exit()
}

const printer = ts.createPrinter()
for (const service of serviceFiles) {
  const sourceFile = ts.createSourceFile(
    service,
    fs.readFileSync(service, { encoding: 'utf-8' }),
    ts.ScriptTarget.ESNext,
  )

  const clientInterface = findClientInterface(sourceFile)
  if (!clientInterface) {
    console.log(`No client TypeScript interface found in file ${service}`)
    continue
  }

  const serviceEndpoints = getServiceEndpoints(clientInterface)
  const nodes = build(serviceEndpoints)

  const mockFilename = `${getFilename(service)}.ts`
  const mockFile = ts.createSourceFile(mockFilename, '', ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
  const output = printer.printList(ts.ListFormat.MultiLine, nodes, mockFile)

  // TODO - configure this
  const outputDir = `../example/${mockFilename}`
  fs.writeFileSync(outputDir, output)
}
