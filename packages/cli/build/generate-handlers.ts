import path from 'path'
import ts, { factory } from 'typescript'
import { ServiceEndpoint } from '../parse'
import { createNewLine } from '../utils/build'
import { getObjectAstPlaceholder } from './object'

/**
 * Builds an AST for mocking GRPC endpoints with MSW
 * @param serviceEndpoints The GRPC endpoints
 * @param outDirPath The path to the folder the files are being output to
 * @param checker Type checker
 * @returns AST to print
 */
export function getHandlersAST(
  serviceEndpoints: ServiceEndpoint[],
  outDirPath: string,
  checker: ts.TypeChecker,
): ts.NodeArray<ts.Node> {
  return factory.createNodeArray([
    createMswImportDec(),
    ...createResponseTypeImportDecs(serviceEndpoints, outDirPath),
    createHelperImport(),
    createNewLine(),
    createHandlers(serviceEndpoints, checker),
  ])
}

/**
 * Creates and returns an AST node for MSW import
 * @returns an ImportDeclaraction
 */
function createMswImportDec(): ts.ImportDeclaration {
  return factory.createImportDeclaration(
    undefined,
    factory.createImportClause(
      false,
      undefined,
      factory.createNamedImports([factory.createImportSpecifier(false, undefined, factory.createIdentifier('rest'))]),
    ),
    factory.createStringLiteral('msw', true),
  )
}

/**
 * Create an ImportDeclaration for helpers
 * @returns ImportDeclaration for importing helper functions
 */
function createHelperImport(): ts.ImportDeclaration {
  return factory.createImportDeclaration(
    undefined,
    factory.createImportClause(
      false,
      undefined,
      factory.createNamedImports([
        factory.createImportSpecifier(false, undefined, factory.createIdentifier('getResultAsString')),
      ]),
    ),
    factory.createStringLiteral('./helpers', true),
  )
}

/**
 * Creates and returns AST node(s) for the response type of the various service endpoints
 * @param serviceEndpoints An array of GRPC endpoints that need response types imported
 * @param outDirPath The path to the folder the files are being output to
 * @returns Array of ImportDeclarations for the corresponding types
 */
function createResponseTypeImportDecs(serviceEndpoints: ServiceEndpoint[], outDirPath: string): ts.ImportDeclaration[] {
  // Group by import path
  const groupByImportPath = serviceEndpoints.reduce(
    (group: Map<string, string[]>, serviceEndpoint: ServiceEndpoint) => {
      const existingGroup = group.get(serviceEndpoint.resImportPath) || []
      group.set(serviceEndpoint.resImportPath, [...existingGroup, serviceEndpoint.resTypeName])
      return group
    },
    new Map<string, string[]>(),
  )

  const result: ts.ImportDeclaration[] = []

  for (const [key, value] of groupByImportPath) {
    const sortedTypes = [...value].sort((a, b) => a.localeCompare(b))
    const dedupedTypes = [...new Set(sortedTypes)]
    const relativePath = path.relative(outDirPath, key)

    result.push(
      factory.createImportDeclaration(
        undefined,
        factory.createImportClause(
          false,
          undefined,
          factory.createNamedImports(
            dedupedTypes.map((t) => factory.createImportSpecifier(false, undefined, factory.createIdentifier(t))),
          ),
        ),
        factory.createStringLiteral(relativePath, true),
      ),
    )
  }

  return result
}

/**
 * Creates and returns an AST node for an MSW handler array for GRPC endpoints
 * @param serviceEndpoints An array of GRPC endpoints to create MSW handlers for
 * @param checker Type checker
 * @returns VariableStatement AST node of a handler array
 */
function createHandlers(serviceEndpoints: ServiceEndpoint[], checker: ts.TypeChecker): ts.VariableStatement {
  const handlerArray = factory.createArrayLiteralExpression(
    serviceEndpoints.map((se) => {
      const propertyAccessExpression = factory.createPropertyAccessExpression(factory.createIdentifier('rest'), 'post')
      const responseArgumentsArray = se.resTypeNode ? [getObjectAstPlaceholder(se.resTypeNode, checker)] : []

      const responseObject = factory.createCallExpression(
        factory.createPropertyAccessExpression(factory.createIdentifier(se.resTypeName), 'toBinary'),
        undefined,
        responseArgumentsArray,
      )
      const responseObjectEncoded = factory.createCallExpression(
        factory.createIdentifier('getResultAsString'),
        undefined,
        [responseObject],
      )

      const functionBody = factory.createBlock(
        [
          factory.createReturnStatement(
            factory.createCallExpression(factory.createIdentifier('res'), undefined, [
              factory.createCallExpression(
                factory.createPropertyAccessExpression(factory.createIdentifier('ctx'), 'status'),
                undefined,
                [factory.createNumericLiteral(200)],
              ),
              factory.createCallExpression(
                factory.createPropertyAccessExpression(factory.createIdentifier('ctx'), 'body'),
                undefined,
                [responseObjectEncoded],
              ),
              factory.createCallExpression(
                factory.createPropertyAccessExpression(factory.createIdentifier('ctx'), 'set'),
                undefined,
                [
                  factory.createStringLiteral('Content-Type', true),
                  factory.createStringLiteral('application/grpc-web-text', true),
                ],
              ),
            ]),
          ),
        ],
        true,
      )

      const functionHandler = factory.createArrowFunction(
        undefined,
        undefined,
        [
          factory.createParameterDeclaration(undefined, undefined, '_req', undefined),
          factory.createParameterDeclaration(undefined, undefined, 'res', undefined),
          factory.createParameterDeclaration(undefined, undefined, 'ctx', undefined),
        ],
        undefined,
        factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
        functionBody,
      )
      // might have to capitalize name
      const args = [factory.createStringLiteral(`/${se.name}`, true), functionHandler]
      const callExpression = factory.createCallExpression(propertyAccessExpression, undefined, args)

      return callExpression
    }),
    true,
  )

  const handlerVariableDeclaration = factory.createVariableDeclaration('handlers', undefined, undefined, handlerArray)
  const handlerDeclarationList = factory.createVariableDeclarationList([handlerVariableDeclaration], ts.NodeFlags.Const)

  return factory.createVariableStatement([factory.createModifier(ts.SyntaxKind.ExportKeyword)], handlerDeclarationList)
}
