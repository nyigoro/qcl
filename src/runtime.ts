export function renderQCL(componentName: string, props: any, container: HTMLElement) {
  window.qclComponents = window.qclComponents || {};
  window.qclState = window.qclState || {};
  let state = window.qclState[componentName] || {};

  // Initialize state from component script
  if (window.qclScripts?.[componentName]) {
    eval(window.qclScripts[componentName]);
  }

  // Render component
  const update = () => {
    const html = window.qclComponents[componentName]?.(props, state) || '';
    container.innerHTML = html;

    // Setup two-way bindings
    container.querySelectorAll('[bind\\:value]').forEach((el: HTMLInputElement) => {
      const stateKey = el.getAttribute('bind:value')!;
      el.value = state[stateKey] || '';
      el.addEventListener('input', () => {
        state[stateKey] = el.value;
        update(); // Re-render on state change
      });
    });
  };

  update();

  // Watch state changes for one-way bindings
  window.qclState[componentName] = new Proxy(state, {
    set(target, key, value) {
      target[key] = value;
      update();
      return true;
    },
  });
}

window.qclScripts = window.qclScripts || {};
