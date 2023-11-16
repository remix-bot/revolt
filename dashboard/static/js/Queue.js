class Queue extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = "TODO: queue component";
  }
}

customElements.define("remix-queue", Queue);
