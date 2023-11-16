class SearchInput extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = "TODO: search input component"
  }
}

customElements.define("search-input", SearchInput);
