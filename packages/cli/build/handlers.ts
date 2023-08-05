import path from 'path'
import ts, { factory } from 'typescript'
import { ServiceEndpoint } from '../parse'

/**
 * Builds an AST for mocking GRPC endpoints with MSW
 * @param serviceEndpoints The GRPC endpoints
 * @param outDirPath The path to the folder the files are being output to
 * @returns AST to print
 */
export function getHandlersAST(serviceEndpoints: ServiceEndpoint[], outDirPath: string): ts.NodeArray<ts.Node> {
  const handlers = createHandlers(serviceEndpoints)
  const mswImportDec = createMswImportDec()
  const responseTypeImportDecs = createResponseTypeImportDecs(serviceEndpoints, outDirPath)
  return factory.createNodeArray([mswImportDec, ...responseTypeImportDecs, createNewLine(), handlers])
}

/**
 * Creates and returns an AST node for an empty line
 * @returns Empty line AST node
 */
function createNewLine(): ts.Identifier {
  return ts.factory.createIdentifier('\n')
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
      group.set(serviceEndpoint.resImportPath, [...existingGroup, serviceEndpoint.resType])
      return group
    },
    new Map<string, string[]>(),
  )

  const result: ts.ImportDeclaration[] = []

  for (const [key, value] of groupByImportPath) {
    const sortedTypes = [...value].sort((a, b) => a.localeCompare(b))
    const relativePath = path.relative(outDirPath, key)

    result.push(
      factory.createImportDeclaration(
        undefined,
        factory.createImportClause(
          true,
          undefined,
          factory.createNamedImports(
            sortedTypes.map((t) => factory.createImportSpecifier(false, undefined, factory.createIdentifier(t))),
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
 * @returns VariableStatement AST node of a handler array
 */
function createHandlers(serviceEndpoints: ServiceEndpoint[]): ts.VariableStatement {
  const handlerArray = factory.createArrayLiteralExpression(
    serviceEndpoints.map((se) => {
      const propertyAccessExpression = factory.createPropertyAccessExpression(factory.createIdentifier('rest'), 'post')

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
                factory.createPropertyAccessExpression(factory.createIdentifier('ctx'), 'json'),
                [factory.createTypeReferenceNode(se.resType)],
                // TODO - build response and pass here instead of undefined
                [factory.createObjectLiteralExpression(undefined, true)],
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
          factory.createParameterDeclaration(undefined, undefined, 'req', undefined),
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
