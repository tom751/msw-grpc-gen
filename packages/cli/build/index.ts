import ts, { factory } from 'typescript'
import { ServiceEndpoint } from '../parse'

/**
 * Builds an AST for mocking GRPC endpoints with MSW
 * @param serviceEndpoints The GRPC endpoints
 * @returns AST to print
 */
export function build(serviceEndpoints: ServiceEndpoint[]): ts.NodeArray<ts.Node> {
  const handlers = createHandlers(serviceEndpoints)
  const mswImportDec = createMswImportDec()
  return factory.createNodeArray([mswImportDec, createNewLine(), handlers])
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
