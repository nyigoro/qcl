import { program } from 'commander';
import { transpileQCL } from './transpiler';
import fs from 'fs';
import path from 'path';

program
  .command('compile <input>')
  .option('--output <path>', 'Output directory', 'dist')
  .action((input, { output }) => {
    const qclCode = fs.readFileSync(input, 'utf-8');
    const translations = JSON.parse(fs.readFileSync(path.join(path.dirname(input), 'locales/en.json'), 'utf-8'));
    const { html, js, css } = transpileQCL(qclCode, { en: translations });
    fs.mkdirSync(output, { recursive: true });
    fs.writeFileSync(
      `${output}/output.html`,
      `<html><head><style>${css}</style></head><body><div id="root">${html}</div><script src="runtime.js"></script><script>${js}</script><script>renderQCL('${Object.keys(window.qclComponents || {}).pop()}', {}, document.getElementById('root'));</script></body></html>`
    );
    fs.writeFileSync(`${output}/runtime.js`, fs.readFileSync(path.join(__dirname, 'runtime.js'), 'utf-8'));
  });

program.parse();
