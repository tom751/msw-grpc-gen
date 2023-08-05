import path from 'path'
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
  resImportPath: string
}

/**
 * Return an array of GRPC service endpoints from an interface
 * @param node A TypeScript interface declaration
 * @returns An array of GRPC service endpoints
 */
export function getServiceEndpoints(node: ts.InterfaceDeclaration): ServiceEndpoint[] {
  return node.members.filter(ts.isMethodSignature).map((m: ts.MethodSignature) => {
    const endpoint: ServiceEndpoint = {
      name: '',
      reqType: '',
      resType: '',
      resImportPath: '',
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

/**
 * Populates resImportPath for an array of ServiceEndpoint
 * @param endpoints An array of GRPC endpoints to create MSW handlers for
 * @param sourceFile The source file currently being read
 * @returns Array of ServiceEndpoints with resImportPath populated
 */
export function getReturnTypeImports(endpoints: ServiceEndpoint[], sourceFile: ts.SourceFile): ServiceEndpoint[] {
  const typeOnlyImports = sourceFile.statements.filter(
    (s) => ts.isImportDeclaration(s) && s.importClause?.isTypeOnly,
  ) as ts.ImportDeclaration[]

  const typeImportsWithNamedImports = typeOnlyImports.filter(
    (t) =>
      !!t.importClause?.namedBindings &&
      ts.isNamedImports(t.importClause.namedBindings) &&
      ts.isStringLiteral(t.moduleSpecifier),
  )

  const currentAbsolutePath = path.resolve(sourceFile.fileName)
  const dir = path.dirname(currentAbsolutePath)

  // Map of typename to import path
  const imports: Record<string, string> = {}
  for (const t of typeImportsWithNamedImports) {
    const typeNames = (t.importClause?.namedBindings as ts.NamedImports).elements.map((e) => e.name.text)

    for (const typeName of typeNames) {
      // Could improve this by checking if duplicate typeName - not sure if this would be an
      // issue because the generated protobuf-ts file would have errors, or an import alias

      // get relative path from file we're reading
      imports[typeName] = path.resolve(dir, (t.moduleSpecifier as ts.StringLiteral).text)
    }
  }

  return [...endpoints].map((e) => {
    const resImportPath = imports[e.resType]

    if (!resImportPath) {
      throw new Error(`Could not find import for ${e.resType}`)
    }

    return {
      ...e,
      resImportPath,
    }
  })
}
