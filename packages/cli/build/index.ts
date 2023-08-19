import ts from 'typescript'
import { findClientInterface, getReturnTypeImports, getServiceEndpoints } from '../parse'
import { getFilename } from '../utils/files'
import { getHandlersAST } from './generate-handlers'
import { helpersFileContent } from './generate-helpers'
import { getIndexAST } from './generate-index'

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

  const handlerVariableName = `${getFilename(filepath)}Handlers`
  const nodes = getHandlersAST(endPointsWithTypePaths, outDirPath, checker, handlerVariableName)

  const mockFile = ts.createSourceFile('service-file', '', ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
  const printer = ts.createPrinter()

  return printer.printList(ts.ListFormat.MultiLine, nodes, mockFile)
}

/**
 * Generate an index.ts file which exports all handlers
 * @param createdFiles The filenames that were generated containing handlers
 * @returns String content of the index.ts file
 */
export function generateIndexFile(createdFiles: string[]): string {
  const indexFile = ts.createSourceFile('index.ts', '', ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
  const nodes = getIndexAST(createdFiles)

  const printer = ts.createPrinter()
  return printer.printList(ts.ListFormat.MultiLine, nodes, indexFile)
}

/**
 * Get the string content of the helpers file
 * @returns String content of the helpers.ts file
 */
export function getHelpersFile(): string {
  return helpersFileContent
}
