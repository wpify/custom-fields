import { createCommand, DecoratorNode } from 'lexical';
import { WpImageComponent } from './WpImageComponent';

export const INSERT_IMAGE_COMMAND = createCommand('wpifycf:richtext:insert-image');

export class WpImageNode extends DecoratorNode {
  __src;
  __alt;
  __width;
  __height;
  __attachmentId;

  static getType() {
    return 'wp-image';
  }

  static clone(node) {
    return new WpImageNode(
      node.__src,
      node.__alt,
      node.__width,
      node.__height,
      node.__attachmentId,
      node.__key,
    );
  }

  constructor(src, alt = '', width = null, height = null, attachmentId = null, key) {
    super(key);
    this.__src = src;
    this.__alt = alt;
    this.__width = width;
    this.__height = height;
    this.__attachmentId = attachmentId;
  }

  isInline() {
    return true;
  }

  createDOM() {
    const span = document.createElement('span');
    span.className = 'wpifycf-richtext-image-host';
    return span;
  }

  updateDOM() {
    return false;
  }

  static importDOM() {
    return {
      img: () => ({
        conversion: (el) => {
          const src = el.getAttribute('src');
          if (!src) return null;
          const alt = el.getAttribute('alt') || '';
          const widthAttr = el.getAttribute('width');
          const heightAttr = el.getAttribute('height');
          const idAttr = el.getAttribute('data-id');
          return {
            node: $createWpImageNode({
              src,
              alt,
              width: widthAttr ? Number(widthAttr) : null,
              height: heightAttr ? Number(heightAttr) : null,
              attachmentId: idAttr ? Number(idAttr) : null,
            }),
          };
        },
        priority: 1,
      }),
    };
  }

  exportDOM() {
    const el = document.createElement('img');
    el.setAttribute('src', this.__src);
    if (this.__alt) el.setAttribute('alt', this.__alt);
    if (this.__width) el.setAttribute('width', String(this.__width));
    if (this.__height) el.setAttribute('height', String(this.__height));
    if (this.__attachmentId) el.setAttribute('data-id', String(this.__attachmentId));
    return { element: el };
  }

  static importJSON(json) {
    return $createWpImageNode(json);
  }

  exportJSON() {
    return {
      type: WpImageNode.getType(),
      version: 1,
      src: this.__src,
      alt: this.__alt,
      width: this.__width,
      height: this.__height,
      attachmentId: this.__attachmentId,
    };
  }

  decorate() {
    return (
      <WpImageComponent
        nodeKey={this.getKey()}
        src={this.__src}
        alt={this.__alt}
        width={this.__width}
        height={this.__height}
      />
    );
  }

  setAlt(value) {
    this.getWritable().__alt = value;
  }

  setAttachment({ src, alt, width, height, attachmentId }) {
    const writable = this.getWritable();
    writable.__src = src;
    if (alt !== undefined) writable.__alt = alt;
    writable.__width = width ?? null;
    writable.__height = height ?? null;
    writable.__attachmentId = attachmentId ?? null;
  }

  getAttachmentId() {
    return this.__attachmentId;
  }

  getAlt() {
    return this.__alt;
  }
}

export function $createWpImageNode({ src, alt = '', width = null, height = null, attachmentId = null } = {}) {
  return new WpImageNode(src, alt, width, height, attachmentId);
}

export function $isWpImageNode(node) {
  return node instanceof WpImageNode;
}
