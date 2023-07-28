import fg from 'fast-glob'
import fs from 'fs'
import ts, { factory } from 'typescript'

const serviceFiles = fg.sync('../example/pb/**.client.ts')

const findInterface = (node: ts.Node): ts.InterfaceDeclaration | undefined => {
  if (ts.isInterfaceDeclaration(node) && node.name.text.endsWith('Client')) {
    return node
  }

  return ts.forEachChild(node, findInterface)
}

const importDec = factory.createImportDeclaration(
  undefined,
  factory.createImportClause(
    false,
    undefined,
    factory.createNamedImports([factory.createImportSpecifier(false, undefined, factory.createIdentifier('msw'))]),
  ),
  factory.createStringLiteral('msw', true),
)

interface ServiceEndpoint {
  name: string
  reqType: string
  resType: string
}

const getServiceEndpoints = (node: ts.InterfaceDeclaration): ServiceEndpoint[] => {
  return node.members.filter(ts.isMethodSignature).map((m: ts.MethodSignature) => {
    const endpoint: ServiceEndpoint = {
      name: '',
      reqType: '',
      resType: '',
    }

    if (ts.isIdentifier(m.name)) {
      endpoint.name = m.name.text
    }

    if (
      m.type &&
      ts.isTypeReferenceNode(m.type) &&
      m.type.typeArguments?.length === 2 &&
      m.type.typeArguments.every(ts.isTypeReferenceNode)
    ) {
      const req = m.type.typeArguments[0]
      const res = m.type.typeArguments[1]
      if (ts.isIdentifier(req.typeName)) {
        endpoint.reqType = req.typeName.text
      }

      if (ts.isIdentifier(res.typeName)) {
        endpoint.resType = res.typeName.text
      }
    }

    return endpoint
  })
}

const createHandlers = (serviceEndpoints: ServiceEndpoint[]): ts.VariableStatement => {
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
                undefined,
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

const printer = ts.createPrinter()
const first = [serviceFiles[0]]
for (const service of first) {
  const sourceFile = ts.createSourceFile(
    service,
    fs.readFileSync(service, { encoding: 'utf-8' }),
    ts.ScriptTarget.ESNext,
  )

  // find client interface
  const clientInterface = findInterface(sourceFile)
  if (!clientInterface) {
    console.log('no interface')
    continue
  }

  const serviceEndpoints = getServiceEndpoints(clientInterface)

  const handlers = createHandlers(serviceEndpoints)
  const nodes = factory.createNodeArray([importDec, handlers])

  const mockFile = ts.createSourceFile('hey.ts', '', ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
  const output = printer.printList(ts.ListFormat.MultiLine, nodes, mockFile)
  console.log(output)
}
