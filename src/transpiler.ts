import { parseQCL } from './parser';
import fs from 'fs';
import path from 'path';

interface ASTNode {
  type: string;
  name?: string;
  attrs?: { name: string; value: string }[];
  content?: any;
  expr?: string;
  component?: string;
  from?: string;
}

export function transpileQCL(qclCode: string, filePath: string = ''): { html: string; js: string; css: string } {
  const ast = parseQCL(qclCode);
  const output = { html: '', js: '', css: '' };
  const components: Record<string, string> = {};
  let scriptContent = '';
  let translations: Record<string, Record<string, string>> = {};
  try {
    translations = {
      en: JSON.parse(fs.readFileSync(path.resolve(path.dirname(filePath), 'locales/en.json'), 'utf-8') || '{}'),
      es: JSON.parse(fs.readFileSync(path.resolve(path.dirname(filePath), 'locales/es.json'), 'utf-8') || '{}'),
    };
  } catch (e) {
    console.warn('Warning: Could not load translations', e);
  }

  function processNode(node: ASTNode, componentId: string): string {
    if (node.type === 'tag') {
      const attrs = node.attrs?.map(attr => {
        if (attr.name === 'bind') {
          return `data-bind="${attr.value}" oninput="qclUpdate('${componentId}', this)"`;
        }
        if (attr.name === 'onclick') {
          return `onclick="${attr.value.replace(/\(.+\)/, '')}()"`;
        }
        return `${attr.name}="${attr.value}"`;
      }).join(' ') || '';
      return `<${node.name} ${attrs}>${node.content?.map((c: ASTNode) => processNode(c, componentId)).join('')}</${node.name}>`;
    } else if (node.type === 'each') {
      return `<template data-each="${node.expr}">${node.content.map((c: ASTNode) => processNode(c, componentId)).join('')}</template>`;
    } else if (node.type === 'text') {
      return node.content.replace(/{t\('([^']+)',\s*{([^}]+)}\)}/g, (match: string, key: string, params: string) => {
        const paramObj = params.split(',').reduce((obj: Record<string, string>, param: string) => {
          const [k, v] = param.split(':').map(s => s.trim());
          obj[k] = v.replace(/props\./g, `window.qclState.${componentId}.`);
          return obj;
        }, {});
        return `<span data-expr="t('${key}', ${JSON.stringify(paramObj)})"></span>`;
      }).replace(/{([^}]+)}/g, `<span data-expr="$1"></span>`);
    }
    return '';
  }

  function processImports(nodes: ASTNode[], basePath: string): ASTNode[] {
    const importedComponents: ASTNode[] = [];
    nodes.forEach(node => {
      if (node.type === 'import') {
        const importPath = path.resolve(basePath, node.from!);
        const importCode = fs.readFileSync(importPath, 'utf-8');
        const importAst = parseQCL(importCode);
        importedComponents.push(...processImports(importAst, path.dirname(importPath)));
      } else {
        importedComponents.push(node);
      }
    });
    return importedComponents;
  }

  const resolvedAst = processImports(ast, path.dirname(filePath));

  resolvedAst.forEach((node: ASTNode) => {
    if (node.type === 'component') {
      const componentId = `${node.name}_${Math.random().toString(36).slice(2, 8)}`;
      components[node.name!] = componentId;
      output.html += node.content?.find((c: ASTNode) => c.type === 'markup')?.content
        .map((c: ASTNode) => processNode(c, componentId)).join('') || '';
      output.css += node.content?.find((c: ASTNode) => c.type === 'style')?.content
        ?.replace(/\.([^{]+)/g, `.${componentId}_$1`) || '';
      scriptContent += node.content?.find((c: ASTNode) => c.type === 'script')?.content || '';
    }
  });

  output.js = `
    ${scriptContent}
    window.qclComponents = ${JSON.stringify(components)};
    window.qclState = {};
    const t = (key: string, params: Record<string, string> = {}) => {
      const translations = ${JSON.stringify(translations)};
      let text = translations[params.lang || 'en']?.[key] || key;
      for (const [param, value] of Object.entries(params)) {
        text = text.replace(new RegExp('{{' + param + '}}', 'g'), value);
      }
      return text;
    };
    qclRender('${Object.values(components)[0]}');
  `;
  return output;
}
