import ts, { factory } from 'typescript'
import { createNewLine } from '../utils/build'

/**
 * Generate an AST of the index.ts file which exports all handlers
 * @param createdFiles The filenames that were generated containing handlers
 * @returns AST of the generated index.ts file
 */
export function getIndexAST(createdFiles: string[]): ts.NodeArray<ts.Node> {
  const importDecs = createdFiles.map(createImportDec)
  const importAliases = createdFiles.map(getImportAlias)

  const variableStatement = factory.createVariableStatement(
    [factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    factory.createVariableDeclarationList(
      [
        factory.createVariableDeclaration(
          'handlers',
          undefined,
          undefined,
          factory.createArrayLiteralExpression(
            importAliases.map((a) => factory.createSpreadElement(factory.createIdentifier(a))),
            true,
          ),
        ),
      ],
      ts.NodeFlags.Const,
    ),
  )

  return factory.createNodeArray([...importDecs, createNewLine(), variableStatement])
}

/**
 * Gets the import alias for importing handlers
 * @param fileName The name of the file being imported
 * @returns Import alias for the handlers
 */
function getImportAlias(fileName: string): string {
  return `${fileName}Handlers`
}

/**
 * Generate an import declaration with alias for importing handlers from a file
 * @param fileName The file to import handlers from
 * @returns An import declaration for importing the handlers
 */
function createImportDec(fileName: string): ts.ImportDeclaration {
  return factory.createImportDeclaration(
    undefined,
    factory.createImportClause(
      false,
      undefined,
      factory.createNamedImports([
        factory.createImportSpecifier(false, undefined, factory.createIdentifier(getImportAlias(fileName))),
      ]),
    ),
    factory.createStringLiteral(`./${fileName}`, true),
  )
}
