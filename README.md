# Quick Component Language (QCL)
QCL is a modern, component-based markup language designed to address HTML’s shortcomings, including lack of components, style scoping, interactivity, data binding, concise syntax, i18n, and modularity. It compiles to vanilla HTML, JavaScript, and CSS for universal compatibility.

## Features

### Components: Reusable, encapsulated components with <component>.
### Scoped Styles: Automatic CSS scoping within <style> blocks.
### Interactivity: Built-in <script> for dynamic behavior.
### Data Binding: Two-way and one-way binding with bind: and props.
### Concise Syntax: Simplified tags like <each> for loops.
### i18n: Native translation with lang and t() function.
### Modularity: Import components with <import>.

## Setup

Clone the repository:git clone https://github.com/nyigoro/quick-component-language.git
cd quick-component-language


Install dependencies:npm install


Compile a QCL file:npx qcl compile examples/app.qcl --output dist



## Example
<component name="Counter" bind:count="state.count">
  <markup>
    <div>
      Count: {count}
      <button onclick={increment}>Add</button>
    </div>
  </markup>
  <script>
    state = { count: 0 };
    function increment() {
      state.count += 1;
    }
  </script>
</component>
<Counter />

## Contributing

Report issues or suggest features on GitHub Issues.
See CONTRIBUTING.md for guidelines.
