class ChannelItem extends HTMLElement {
  constructor() {
    super();
  }
}

class ServerItem extends HTMLElement {
  constructor() {
    super();
  }
}

class ServerList extends HTMLElement {
  ul = null;

  constructor() {
    super();
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });

    const h1 = document.createElement("h1");
    h1.innerText = "Your Servers";
    const br = document.createElement("br");
    const ul = document.createElement("ul");
    ul.innerText = "Loading...";
    this.ul = ul;
    shadow.append(h1, br, ul);
  }
}

customElements.define("remix-server-list", ServerList);
customElements.define("remix-server-item", ServerItem);
customElements.define("remix-channel-item", ChannelItem);
