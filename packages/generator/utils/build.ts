import ts from 'typescript'

/**
 * Creates and returns an AST node for an empty line
 * @returns Empty line AST node
 */
export function createNewLine(): ts.Identifier {
  return ts.factory.createIdentifier('\n')
}
