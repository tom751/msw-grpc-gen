import ts, { factory } from 'typescript'

/**
 * Create and return an object of a specfic type, with all properties set to their
 * default values
 * @param type The type of object to create
 * @param checker Type checker
 * @returns The constructed object with default values
 */
export function getObjectPlaceholder(type: ts.Type, checker: ts.TypeChecker): Object {
  const result = {}

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

      if (typeAsString === 'Date') {
        properties.push(
          factory.createPropertyAssignment(
            prop.name,
            factory.createNewExpression(factory.createIdentifier('Date'), [], []),
          ),
        )
      } else {
        // it's an object
        properties.push(factory.createPropertyAssignment(prop.name, getObjectAstPlaceholder(propType, checker)))
      }

      continue
    }

    const defaultVal = defaultVals[propTypeNode.kind]

    if (propTypeNode.kind === ts.SyntaxKind.StringKeyword) {
      properties.push(factory.createPropertyAssignment(prop.name, factory.createStringLiteral(defaultVal, true)))
    } else if (propTypeNode.kind === ts.SyntaxKind.NumberKeyword) {
      properties.push(factory.createPropertyAssignment(prop.name, factory.createNumericLiteral(defaultVal)))
    } else if (propTypeNode.kind === ts.SyntaxKind.BooleanKeyword) {
      properties.push(factory.createPropertyAssignment(prop.name, factory.createFalse()))
    } else if (propTypeNode.kind === ts.SyntaxKind.ArrayType) {
      properties.push(factory.createPropertyAssignment(prop.name, factory.createArrayLiteralExpression(defaultVal)))
    }
  }

  return factory.createObjectLiteralExpression(properties, true)
}

// rome-ignore lint/suspicious/noExplicitAny: This can return any type
const defaultVals: Record<number, any> = {
  [ts.SyntaxKind.StringKeyword]: '',
  [ts.SyntaxKind.NumberKeyword]: 0,
  [ts.SyntaxKind.BooleanKeyword]: false,
  [ts.SyntaxKind.ArrayType]: [],
}
