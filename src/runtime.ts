declare global {
  interface Window {
    qclComponents: Record<string, string>;
    qclState: Record<string, any>;
    qclUpdate: (componentId: string, element: HTMLInputElement) => void;
  }
}

export function renderQCL(componentId: string, props: any, container: HTMLElement) {
  window.qclState[componentId] = window.qclState[componentId] || {};
  Object.assign(window.qclState[componentId], props);
  qclRender(componentId);
}

function qclRender(componentId: string) {
  let state = window.qclState[componentId] || {};
  document.querySelectorAll<HTMLInputElement>('[data-bind]').forEach((el) => {
    let expr = el.dataset.bind!;
    el.value = state[expr] || '';
  });
  document.querySelectorAll('[data-expr]').forEach((el) => {
    let expr = el.dataset.expr!;
    try {
      el.textContent = eval(expr);
    } catch (e) {
      el.textContent = '';
    }
  });
  document.querySelectorAll('[data-each]').forEach((tmpl) => {
    let expr = tmpl.dataset.each!;
    let items = eval(expr) || [];
    let parent = tmpl.parentElement!;
    let html = '';
    items.forEach((item: any) => {
      let content = tmpl.innerHTML.replace(/{item\.([^}]+)}/g, (_, p) => item[p]);
      html += content;
    });
    parent.innerHTML = html;
  });
}

window.qclUpdate = function(componentId: string, element: HTMLInputElement) {
  let expr = element.dataset.bind!;
  window.qclState[componentId] = window.qclState[componentId] || {};
  window.qclState[componentId][expr] = element.value;
  qclRender(componentId);
};

window.qclState = {};
