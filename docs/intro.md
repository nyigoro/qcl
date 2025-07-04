# Quick Component Language (QCL)
QCL is a universal, component-based markup language that enhances HTML with components, scoped styles, data binding, and i18n.

## Example
<qcl>
  <component name="Counter">
    <markup>
      <input bind={state.count} />
      <button onclick={increment}>Add</button>
    </markup>
    <script>
      state = { count: 0 };
      function increment() { state.count += 1; qclRender('Counter_123'); }
    </script>
  </component>
</qcl>

## Installation
```bash
npm install qcl
npx qcl compile input.qcl --output dist
