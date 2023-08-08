import ts from 'typescript'
import { findClientInterface, getReturnTypeImports, getServiceEndpoints } from '../parse'
import { getHandlersAST } from './handlers'

/**
 * Generate MSW handlers for specific GRPC client
 * @param filepath The filepath to the GRPC client to create mocks for
 * @param outDirPath The path to the folder the files are being output to
 * @param prog The TypeScript program - used to get the type checker
 * @returns String content of the mock file
 */
export function generateHandlers(filepath: string, outDirPath: string, prog: ts.Program): string {
  const sourceFile = prog.getSourceFile(filepath)
  if (!sourceFile) {
    console.log(`No source file ${filepath}`)
    return ''
  }

  const clientInterface = findClientInterface(sourceFile)
  if (!clientInterface) {
    console.log(`No client TypeScript interface found in file ${filepath}`)
    return ''
  }

  const checker = prog.getTypeChecker()

  const serviceEndpoints = getServiceEndpoints(clientInterface, checker)
  const endPointsWithTypePaths = getReturnTypeImports(serviceEndpoints, sourceFile)
  const nodes = getHandlersAST(endPointsWithTypePaths, outDirPath, checker)

  const mockFile = ts.createSourceFile('service-file', '', ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
  const printer = ts.createPrinter()

  return printer.printList(ts.ListFormat.MultiLine, nodes, mockFile)
}
