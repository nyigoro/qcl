import { parseQCL } from './parser';

interface ASTNode {
  type: string;
  name?: string;
  attrs?: { name: string; value: string }[];
  content?: any[];
  tagName?: string;
  item?: string;
  collection?: string;
  path?: string;
}

export function transpileQCL(qclCode: string, translations: Record<string, Record<string, string>> = {}) {
  const ast = parseQCL(qclCode);
  const output = { html: '', js: '', css: '' };
  const components: Record<string, ASTNode> = {};
  const imports: { component: string; path: string }[] = [];

  // Process AST
  ast.forEach((node: ASTNode) => {
    if (node.type === 'component') {
      components[node.name!] = node;
    } else if (node.type === 'import') {
      imports.push({ component: node.component!, path: node.path! });
    }
  });

  // Generate code for each component instance
  ast.forEach((node: ASTNode) => {
    if (node.type === 'component' && !node.attrs?.find(attr => attr.name === 'name')) {
      const component = components[node.name!];
      const componentId = `${node.name}_${Math.random().toString(36).slice(2, 8)}`;
      const props: Record<string, string> = {};
      const bindings: { prop: string; stateKey: string }[] = [];

      // Process attributes
      node.attrs?.forEach(attr => {
        if (attr.name.startsWith('bind:')) {
          bindings.push({ prop: attr.name.slice(5), stateKey: attr.value });
        } else {
          props[attr.name] = attr.value;
        }
      });

      // Generate HTML
      const renderMarkup = (content: any[]): string => {
        return content.map(item => {
          if (item.type === 'tag') {
            const attrs = item.attrs?.map(attr => `${attr.name}="${attr.value}"`).join(' ') || '';
            return `<${item.tagName} ${attrs}>${renderMarkup(item.content)}</${item.tagName}>`;
          } else if (item.type === 'text') {
            return item.content;
          } else if (item.type === 'binding') {
            return `\${${item.name}}`;
          } else if (item.type === 'each') {
            return `\${${item.collection}.map(${item.item} => \`${renderMarkup(item.content)}\`).join('')}`;
          }
          return '';
        }).join('');
      };

      output.html += renderMarkup(component.content.find((c: any) => c.type === 'markup')?.content || []);

      // Generate CSS (scoped)
      const style = component.content.find((c: any) => c.type === 'style')?.content || '';
      output.css += style.replace(/\.([^{]+)/g, `.${componentId}_$1`);

     // In transpileQCL
output.js += `
  window.qclScripts['${node.name}_${componentId}'] = \`${component.content.find((c: any) => c.type === 'script')?.content || ''}\`;
  window.qclState = window.qclState || {};
  window.qclState['${node.name}_${componentId}'] = {};
`;
      
      // Generate JS (with data binding)
      const script = component.content.find((c: any) => c.type === 'script')?.content || '';
      output.js += `
        window.qclComponents = window.qclComponents || {};
        window.qclComponents['${node.name}_${componentId}'] = (props, state) => {
          return \`${output.html.replace(/\$/g, '\\$')}\`
            .replace(/\\${props.([^}]+)}/g, (_, p) => props[p] || '')
            ${bindings.map(b => `.replace(/\\${state.${b.stateKey}}/g, state['${b.stateKey}'] || '')`).join('')};
        };
        ${script}
      `;
    }
  });

  // Add i18n support
  output.js += `
    const translations = ${JSON.stringify(translations)};
    const t = (key, params = {}, lang = 'en') => {
      let text = translations[lang]?.[key] || key;
      for (const [param, value] of Object.entries(params)) {
        text = text.replace(\`{{${param}}}\`, value);
      }
      return text;
    };
  `;

  // Add imports
  imports.forEach(imp => {
    output.js += `// Import ${imp.component} from ${imp.path}\n`;
  });

  return output;
}
