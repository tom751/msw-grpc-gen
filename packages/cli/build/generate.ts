import fs from 'fs'
import ts from 'typescript'
import { build } from '.'
import { findClientInterface, getServiceEndpoints } from '../parse'
import { getFilename } from '../utils/files'

/**
 * Generate mock file for specific GRPC client
 * @param filepath The filepath to the GRPC client to create mocks for
 * @returns String content of the mock file
 */
export function generate(filepath: string): string {
  const sourceFile = ts.createSourceFile(
    filepath,
    fs.readFileSync(filepath, { encoding: 'utf-8' }),
    ts.ScriptTarget.ESNext,
  )

  const clientInterface = findClientInterface(sourceFile)
  if (!clientInterface) {
    console.log(`No client TypeScript interface found in file ${filepath}`)
    return ''
  }

  const serviceEndpoints = getServiceEndpoints(clientInterface)
  const nodes = build(serviceEndpoints)

  const mockFilename = `${getFilename(filepath)}.ts`
  const mockFile = ts.createSourceFile(mockFilename, '', ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
  const printer = ts.createPrinter()

  return printer.printList(ts.ListFormat.MultiLine, nodes, mockFile)
}
