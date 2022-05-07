export class PathNode {
  pathName: string;
  alternate?: string;

  constructor(pathName: string, alternate?: string) {
    this.pathName = pathName;
    this.alternate = alternate; // Used only for \sqrt, \phase, & tall delims
  }

  toNode(): Node {
    const svgNS = "http://www.w3.org/2000/svg";
    const node = document.createElementNS(svgNS, "path");

    if (this.alternate) {
      node.setAttribute("d", this.alternate);
    } else {
      //   node.setAttribute("d", path[this.pathName]);
    }

    return node;
  }

  toMarkup(): string {
    return `<path d='${this.alternate}'/>`;
    // if (this.alternate) {
    //   return `<path d='${this.alternate}'/>`;
    // } else {
    //   return `<path d='${path[this.pathName]}'/>`;
    // }
  }
}
export type SvgChildNode = PathNode | LineNode;
export class SvgNode {
  children: SvgChildNode[];
  attributes: { [x: string]: string };

  constructor(children?: SvgChildNode[], attributes?: { [x: string]: string }) {
    this.children = children || [];
    this.attributes = attributes || {};
  }

  toNode(): Node {
    const svgNS = "http://www.w3.org/2000/svg";
    const node = document.createElementNS(svgNS, "svg");

    // Apply attributes
    for (const attr in this.attributes) {
      if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
        node.setAttribute(attr, this.attributes[attr]);
      }
    }

    for (let i = 0; i < this.children.length; i++) {
      node.append(this.children[i].toNode());
    }
    return node;
  }

  toMarkup(): string {
    let markup = "<svg xmlns='http://www.w3.org/2000/svg'";
    // Apply attributes
    for (const attr in this.attributes) {
      if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
        markup += ` ${attr}='${this.attributes[attr]}'`;
      }
    }

    markup += ">";

    for (let i = 0; i < this.children.length; i++) {
      markup += this.children[i].toMarkup();
    }

    markup += "</svg>";

    return markup;
  }
}

export class LineNode {
  attributes: { [x: string]: string };

  constructor(attributes?: { [x: string]: string }) {
    this.attributes = attributes || {};
  }

  toNode(): Node {
    const svgNS = "http://www.w3.org/2000/svg";
    const node = document.createElementNS(svgNS, "line");

    // Apply attributes
    for (const attr in this.attributes) {
      if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
        node.setAttribute(attr, this.attributes[attr]);
      }
    }

    return node;
  }

  toMarkup(): string {
    let markup = "<line";

    for (const attr in this.attributes) {
      if (Object.prototype.hasOwnProperty.call(this.attributes, attr)) {
        markup += ` ${attr}='${this.attributes[attr]}'`;
      }
    }

    markup += "/>";

    return markup;
  }
}
