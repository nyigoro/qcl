import { transpileQCL } from '../src/transpiler';

test('transpiles QCL to HTML with data binding', () => {
  const qcl = `
    <qcl>
      <component name="Test">
        <markup>
          <input bind={state.value} />
          <span>{state.value}</span>
        </markup>
        <script>
          state = { value: '' };
        </script>
      </component>
    </qcl>
  `;
  const { html, js } = transpileQCL(qcl);
  expect(html).toContain('data-bind="state.value"');
  expect(html).toContain('data-expr="state.value"');
  expect(js).toContain('state = { value: "" };');
  expect(js).toContain('qclUpdate');
});
