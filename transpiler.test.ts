import { transpileQCL } from '../src/transpiler';

describe('QCL Transpiler', () => {
  test('transpiles component with binding', () => {
    const qcl = `
      <qcl>
        <component name="Test">
          <markup><h1>{props.title}</h1></markup>
        </component>
        <Test title="Hello" />
      </qcl>
    `;
    const { html, js, css } = transpileQCL(qcl);
    expect(html).toContain('<h1>Hello</h1>');
    expect(js).toContain('window.qclComponents');
  });

  test('transpiles two-way binding', () => {
    const qcl = `
      <qcl>
        <component name="Input" bind:value="state.input">
          <markup><input type="text" bind:value="state.input" /></markup>
        </component>
        <Input />
      </qcl>
    `;
    const { js } = transpileQCL(qcl);
    expect(js).toContain('state[\'input\']');
  });
});
