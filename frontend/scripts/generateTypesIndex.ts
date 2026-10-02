import * as fs from 'fs';
import * as path from 'path';

const generatedFile = fs.readFileSync(
    path.join(__dirname, '../src/types/api.generated.ts'),
    'utf8'
);

// Only extract types from the schemas section
const schemasMatch = generatedFile.match(/schemas:\s*{([\s\S]*?)(?=\n    };\n  };)/);

if (!schemasMatch) {
    console.error('Could not find schemas section in generated file');
    process.exit(1);
}

const schemasContent = schemasMatch[1];

// Extract schema names — only valid PascalCase type names (DTOs and models)
const schemaNames = [...schemasContent.matchAll(/^\s{4}(\w+):\s*{/gm)]
    .map(match => match[1])
    .filter(name => {
        // Only keep PascalCase names that look like actual types
        return /^[A-Z][a-zA-Z]+$/.test(name);
    })
    .filter((name, index, self) => self.indexOf(name) === index);

// Generate index.ts content
const indexContent = `// Auto generated — do not edit manually
// Run npm run generate:types to regenerate

import type { components } from './api.generated';

${schemaNames.map(name =>
    `export type ${name} = components['schemas']['${name}'];`
).join('\n')}
`;

fs.writeFileSync(
    path.join(__dirname, '../src/types/index.ts'),
    indexContent
);

console.log(`✅ Generated index.ts with ${schemaNames.length} types`);
schemaNames.forEach(name => console.log(`   → ${name}`));
