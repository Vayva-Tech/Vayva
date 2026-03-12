/**
 * jscodeshift transform to refactor raw <button> elements to <Button> components
 * 
 * Usage: jscodeshift -t scripts/button-transform.js --parser=tsx <path>
 */

module.exports = function transformer(file, api) {
    const j = api.jscodeshift;
    const root = j(file.source, { parser: 'tsx' });

    let hasChanges = false;

    // Skip UI primitives
    if (file.path.includes('/ui/toast.') || file.path.includes('/ui/Switch.') || file.path.includes('/ui/switch.')) {
        return file.source;
    }

    // Helper to determine variant based on className and content
    function determineVariant(element) {
        const classNameAttr = element.openingElement.attributes.find(
            attr => attr.name && attr.name.name === 'className'
        );

        let className = '';
        if (classNameAttr && classNameAttr.value) {
            if (classNameAttr.value.type === 'StringLiteral') {
                className = classNameAttr.value.value;
            } else if (classNameAttr.value.type === 'JSXExpressionContainer') {
                // Handle cn() or template literals
                const expr = classNameAttr.value.expression;
                if (expr.type === 'CallExpression') {
                    // Try to extract string literals from cn() arguments
                    expr.arguments.forEach(arg => {
                        if (arg.type === 'StringLiteral') {
                            className += ' ' + arg.value;
                        }
                    });
                }
            }
        }

        const combined = className.toLowerCase();

        // Determine variant
        if (/close|dismiss|×|x-icon|xicon/.test(combined)) {
            return { variant: 'ghost', size: 'icon' };
        }
        if (/delete|remove|destroy|danger|red-|destructive/.test(combined)) {
            return { variant: 'destructive' };
        }
        if (/primary|submit|save|create|add|bg-primary|bg-green|bg-\[#22c55e\]/.test(combined)) {
            return { variant: 'primary' };
        }
        if (/secondary|outline|border-/.test(combined)) {
            return { variant: 'outline' };
        }
        if (/link|underline|text-primary|text-blue/.test(combined)) {
            return { variant: 'link' };
        }
        if (/ghost|transparent|bg-white\/|bg-gray-/.test(combined)) {
            return { variant: 'ghost' };
        }

        return { variant: 'ghost' };
    }

    // Find all JSXElement nodes with name 'button'
    root.find(j.JSXElement, {
        openingElement: { name: { name: 'button' } }
    }).forEach(path => {
        const element = path.node;

        // Skip if it has role="switch" or other special cases
        const hasSpecialRole = element.openingElement.attributes.some(attr => {
            if (attr.name && attr.name.name === 'role' && attr.value) {
                return attr.value.value === 'switch';
            }
            return false;
        });

        if (hasSpecialRole) {
            return;
        }

        // Determine variant
        const { variant, size } = determineVariant(element);

        // Check if variant already exists
        const hasVariant = element.openingElement.attributes.some(
            attr => attr.name && attr.name.name === 'variant'
        );

        const hasSize = element.openingElement.attributes.some(
            attr => attr.name && attr.name.name === 'size'
        );

        // Add variant attribute if not present
        if (!hasVariant) {
            element.openingElement.attributes.push(
                j.jsxAttribute(
                    j.jsxIdentifier('variant'),
                    j.stringLiteral(variant)
                )
            );
        }

        // Add size attribute if determined and not present
        if (size && !hasSize) {
            element.openingElement.attributes.push(
                j.jsxAttribute(
                    j.jsxIdentifier('size'),
                    j.stringLiteral(size)
                )
            );
        }

        // Change element name from 'button' to 'Button'
        element.openingElement.name = j.jsxIdentifier('Button');
        if (element.closingElement) {
            element.closingElement.name = j.jsxIdentifier('Button');
        }

        hasChanges = true;
    });

    if (!hasChanges) {
        return file.source;
    }

    // Add Button import if not present
    const hasButtonImport = root.find(j.ImportDeclaration, {
        source: { value: '@vayva/ui' }
    }).filter(path => {
        return path.node.specifiers.some(spec =>
            spec.type === 'ImportSpecifier' && spec.imported.name === 'Button'
        );
    }).length > 0;

    if (!hasButtonImport) {
        // Find existing @vayva/ui import
        const vayvaImport = root.find(j.ImportDeclaration, {
            source: { value: '@vayva/ui' }
        });

        if (vayvaImport.length > 0) {
            // Add Button to existing import
            vayvaImport.forEach(path => {
                path.node.specifiers.push(
                    j.importSpecifier(j.identifier('Button'))
                );
            });
        } else {
            // Add new import
            const firstImport = root.find(j.ImportDeclaration).at(0);
            if (firstImport.length > 0) {
                firstImport.insertAfter(
                    j.importDeclaration(
                        [j.importSpecifier(j.identifier('Button'))],
                        j.stringLiteral('@vayva/ui')
                    )
                );
            } else {
                // No imports, add at the beginning
                root.get().node.program.body.unshift(
                    j.importDeclaration(
                        [j.importSpecifier(j.identifier('Button'))],
                        j.stringLiteral('@vayva/ui')
                    )
                );
            }
        }
    }

    return root.toSource({ quote: 'single' });
};
