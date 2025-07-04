import { program } from 'commander';
import { transpileQCL } from './transpiler';
import fs from 'fs';
import path from 'path';

program
  .command('compile <input>')
  .option('--output <path>', 'Output directory', 'dist')
  .option('--output-file <file>', 'Output file name', 'output.html')
  .action((input, { output, outputFile }) => {
    const qclCode = fs.readFileSync(input, 'utf-8');
    const { html, js, css } = transpileQCL(qclCode, input);
    fs.mkdirSync(output, { recursive: true });
    const outputPath = path.join(output, outputFile);
    fs.writeFileSync(outputPath, `
      <html>
        <head>
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script src="runtime.js"></script>
          <script>${js}</script>
        </body>
      </html>
    `);
    fs.copyFileSync('dist/runtime.js', path.join(output, 'runtime.js'));
    console.log(`Compiled QCL to ${outputPath}`);
  });

program.parse();
