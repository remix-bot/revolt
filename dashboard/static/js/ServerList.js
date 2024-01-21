class ChannelItem extends HTMLElement {
  constructor() {
    super();
  }
}

class ServerItem extends HTMLElement {
  i = null;
  li = null;
  css = null;
  list = null;

  constructor() {
    super();
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });

    const styles = document.createElement("link");
    styles.rel = "stylesheet";
    styles.href = "/css/ServerList.css";
    shadow.append(styles);

    const css = document.createElement("style");
    this.css = css;
    shadow.append(css);

    const li = document.createElement("li");
    this.li = li;
    shadow.append(li);

    const caret = document.createElement("span");
    caret.classList.add("caret");
    li.append(caret);

    const list = document.createElement("ul");
    list.classList.add("nested");
    list.style.listStyle = "inside";
    this.list = list;
    li.append(list);

    if (!this.i) return;
    this.#updateServer();
  }
  #updateServer() {
    if (this.i.icon) {
      this.li.style.listStyle = "none";
      this.css.sheet.insertRule("li[itemid='" + this.i.id + "']::before {content:''; display: inline-block; position: relative; top: 0.4rem; background-image:url(" + this.i.icon + "); background-size: cover; aspect-ratio: 1/1; height: 1.5rem; margin-right: 0.2rem; margin-left: 0.2rem; padding: 0;}"); //" + bs + "}");
    }
    this.li.append(this.i.name);
    this.li.setAttribute("itemId", this.i.id);

    this.li.onclick = () => {
      this.expand();
    }

    if (this.i.voiceChannels.length === 0) return;
    this.#createChannelList();
  }
  #createChannelList() {
    const list = this.list;
    this.i.voiceChannels.forEach(c => {
      const channel = document.createElement("remix-channel-item");
      channel.channel = c;
      list.append(channel);
    });
  }

  expand() {

  }

  set server(s) {
    this.i = s;
    if (!this.isConnected) return;
    this.#updateServer();
  }
  get server() {
    return this.i;
  }
}

class ServerList extends HTMLElement {
  ul = null;

  api = window.remix?.api || null;

  constructor() {
    super();
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });

    const styles = document.createElement("link");
    styles.rel = "stylesheet";
    styles.href = "/css/ServerList.css";
    shadow.append(styles);

    const con = document.createElement("div");
    con.classList.add("con");
    shadow.append(con);

    const h1 = document.createElement("h1");
    h1.innerText = "Your Servers";
    const br = document.createElement("br");
    const ul = document.createElement("ul");
    ul.innerText = "Loading...";
    this.ul = ul;
    con.append(h1, br, ul);
  }

  async load() {
    this.api ||= window.remix?.api || null;
    if (!this.api) throw "No API wrapper passed";

    const servers = await this.api.getServers();
    this.ul.replaceChildren();
    if (!servers) return;
    servers.forEach(s => {
      const server = document.createElement("remix-server-item");
      server.server = s;
      this.ul.appendChild(server);
    });
  }
}

customElements.define("remix-server-list", ServerList);
customElements.define("remix-server-item", ServerItem);
customElements.define("remix-channel-item", ChannelItem);
