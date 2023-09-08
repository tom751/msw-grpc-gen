import ts, { factory } from 'typescript'

/**
 * Create and return an object of a specfic type, with all properties set to their
 * default values
 * @param type The type of object to create
 * @param checker Type checker
 * @returns The constructed object with default values
 */
export function getObjectPlaceholder(type: ts.Type, checker: ts.TypeChecker): Object {
  const result: Record<string, unknown> = {}

  for (const prop of type.getProperties()) {
    const propType = checker.getTypeOfSymbol(prop)
    const propTypeNode = checker.typeToTypeNode(propType, undefined, undefined)

    if (!propTypeNode) {
      continue
    }

    if (propTypeNode.kind === ts.SyntaxKind.TypeReference) {
      const typeAsString = checker.symbolToString(propType.symbol)

      if (typeAsString === 'Date') {
        result[prop.name] = new Date()
      } else if (typeAsString === 'Uint8Array') {
        result[prop.name] = new Uint8Array()
      } else {
        // it's an object
        result[prop.name] = getObjectPlaceholder(propType, checker)
      }

      continue
    }

    result[prop.name] = defaultVals[propTypeNode.kind]
  }

  return result
}

/**
 * Create and return an AST node for an object of a specific type, with all
 * properties set to their default values
 * @param type The type of object to create
 * @param checker Type checker
 * @returns The constructed object as an ObjectLiteralExpression
 */
export function getObjectAstPlaceholder(type: ts.Type, checker: ts.TypeChecker): ts.ObjectLiteralExpression {
  const properties: ts.PropertyAssignment[] = []

  for (const prop of type.getProperties()) {
    const propType = checker.getTypeOfSymbol(prop)
    const propTypeNode = checker.typeToTypeNode(propType, undefined, undefined)

    if (!propTypeNode) {
      continue
    }

    if (propTypeNode.kind === ts.SyntaxKind.TypeReference) {
      const typeAsString = checker.symbolToString(propType.symbol)

      if (typeAsString === 'Date' || typeAsString === 'Uint8Array') {
        properties.push(
          factory.createPropertyAssignment(
            prop.name,
            factory.createNewExpression(factory.createIdentifier(typeAsString), [], []),
          ),
        )
      } else if ((propType.flags & ts.TypeFlags.EnumLiteral) === ts.TypeFlags.EnumLiteral) {
        // It's an enum - select first by default
        properties.push(factory.createPropertyAssignment(prop.name, factory.createNumericLiteral(0)))
      } else {
        // It's an object
        properties.push(factory.createPropertyAssignment(prop.name, getObjectAstPlaceholder(propType, checker)))
      }

      continue
    }

    const defaultVal = defaultVals[propTypeNode.kind]

    // default to empty object - works for maps
    let initializer: ts.Expression = factory.createObjectLiteralExpression()

    switch (propTypeNode.kind) {
      case ts.SyntaxKind.StringKeyword:
        initializer = factory.createStringLiteral(defaultVal, true)
        break
      case ts.SyntaxKind.NumberKeyword:
        initializer = factory.createNumericLiteral(defaultVal)
        break
      case ts.SyntaxKind.BigIntKeyword:
        initializer = factory.createBigIntLiteral(defaultVal)
        break
      case ts.SyntaxKind.BooleanKeyword:
        initializer = factory.createFalse()
        break
      case ts.SyntaxKind.ArrayType:
        initializer = factory.createArrayLiteralExpression(defaultVal)
        break
    }

    properties.push(factory.createPropertyAssignment(prop.name, initializer))
  }

  return factory.createObjectLiteralExpression(properties, true)
}

// biome-ignore lint/suspicious/noExplicitAny: This can return any type
const defaultVals: Record<number, any> = {
  [ts.SyntaxKind.StringKeyword]: '',
  [ts.SyntaxKind.NumberKeyword]: 0,
  [ts.SyntaxKind.BigIntKeyword]: '0n',
  [ts.SyntaxKind.BooleanKeyword]: false,
  [ts.SyntaxKind.ArrayType]: [],
}
