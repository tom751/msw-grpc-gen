import ts from 'typescript'

/**
 * Finds the first TypeScript interface node where the name ends with 'Client'
 * @param node Any AST node
 * @returns a matching InterfaceDeclaration node or undefined
 */
export function findClientInterface(node: ts.Node): ts.InterfaceDeclaration | undefined {
  if (ts.isInterfaceDeclaration(node) && node.name.text.endsWith('Client')) {
    return node
  }

  return ts.forEachChild(node, findClientInterface)
}

export interface ServiceEndpoint {
  name: string
  reqType: string
  resType: string
}

/**
 * Return a list of GRPC service endpoints from an interface
 * @param node A TypeScript interface declaration
 * @returns An array of GRPC service endpoints
 */
export function getServiceEndpoints(node: ts.InterfaceDeclaration): ServiceEndpoint[] {
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
