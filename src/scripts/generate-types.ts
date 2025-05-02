import * as fs from 'fs';
import * as path from 'path';

interface Binding {
    name: string;
    className: string;
    importPath: string;
}

function parseWorkerConfig(): Binding[] {
    const configPath = path.join(process.cwd(), 'worker-configuration.d.ts');
    const content = fs.readFileSync(configPath, 'utf-8');
    
    // Extract bindings using regex
    const bindingRegex = /(\w+):\s*DurableObjectNamespace<import\("(.+)"\)\.(\w+)>/g;
    const bindings: Binding[] = [];
    
    let match;
    while ((match = bindingRegex.exec(content)) !== null) {
        // Remove both ./src/ and ./ prefixes and add ./ back
        const importPath = './' + match[2].replace(/^\.\/src\//, '').replace(/^\.\//, '');
        bindings.push({
            name: match[1],
            className: match[3],
            importPath
        });
    }
    
    return bindings;
}

function generateTypesContent(bindings: Binding[]): string {
    // Generate unique imports
    const imports = [...new Set(bindings.map(b => 
        `import { ${b.className} } from "${b.importPath}";`
    ))].join('\n');

    // Generate Env type
    const envTypes = bindings.map(b =>
        `    ${b.name}: DurableObjectNamespace;`
    ).join('\n');

    // Generate typeMap
    const typeMapEntries = bindings.map(b =>
        `    ${b.name}: ${b.className}`
    ).join(',\n');

    return `${imports}

export type Env = {
${envTypes}
}

export const typeMap = {
${typeMapEntries}
}
`;
}

function main() {
    const bindings = parseWorkerConfig();
    const content = generateTypesContent(bindings);
    
    const typesPath = path.join(process.cwd(), 'src', 'types.ts');
    fs.writeFileSync(typesPath, content);
    
    console.log('Types generated successfully!');
}

main();