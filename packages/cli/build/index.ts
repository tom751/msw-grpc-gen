import fs from 'fs'
import ts from 'typescript'
import { findClientInterface, getReturnTypeImports, getServiceEndpoints } from '../parse'
import { getHandlersAST } from './handlers'

/**
 * Generate MSW handlers for specific GRPC client
 * @param filepath The filepath to the GRPC client to create mocks for
 * @param outDirPath The path to the folder the files are being output to
 * @returns String content of the mock file
 */
export function generateHandlers(filepath: string, outDirPath: string): string {
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
  const endPointsWithTypePaths = getReturnTypeImports(serviceEndpoints, sourceFile)
  const nodes = getHandlersAST(endPointsWithTypePaths, outDirPath)

  const mockFile = ts.createSourceFile('service-file', '', ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
  const printer = ts.createPrinter()

  return printer.printList(ts.ListFormat.MultiLine, nodes, mockFile)
}
