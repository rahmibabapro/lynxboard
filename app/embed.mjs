import {
  buildWidgetUrl,
  EMBED_SANDBOX,
  normalizeEmbedHeight,
} from "./embed-config.mjs";

const MODULE_URL = import.meta.url;

class LynxBoardElement extends HTMLElement {
  static observedAttributes = ["height", "lang", "refresh", "title"];

  #frame;
  #renderQueued = false;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = `
      :host {
        display: block;
        width: 100%;
        max-width: 562px;
        min-width: 0;
        overflow: hidden;
        background: #111318;
      }
      iframe {
        display: block;
        width: 100%;
        border: 0;
        background: #111318;
        color-scheme: dark;
      }
    `;

    this.#frame = document.createElement("iframe");
    this.#frame.part = "frame";
    this.#frame.loading = "eager";
    this.#frame.referrerPolicy = "no-referrer";
    this.#frame.setAttribute("sandbox", EMBED_SANDBOX);
    shadow.append(style, this.#frame);
  }

  connectedCallback() {
    this.#queueRender();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.#queueRender();
  }

  #queueRender() {
    if (this.#renderQueued) return;
    this.#renderQueued = true;
    queueMicrotask(() => {
      this.#renderQueued = false;
      if (this.isConnected) this.#render();
    });
  }

  #render() {
    const height = normalizeEmbedHeight(this.getAttribute("height"));
    this.#frame.height = String(height);
    this.#frame.title = this.getAttribute("title")?.trim() || "Live GitHub Project progress";
    this.#frame.src = buildWidgetUrl(MODULE_URL, {
      lang: this.getAttribute("lang"),
      refresh: this.getAttribute("refresh"),
    });
  }
}

if (!customElements.get("lynx-board")) {
  customElements.define("lynx-board", LynxBoardElement);
}

export { LynxBoardElement };
