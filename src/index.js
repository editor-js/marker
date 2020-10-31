/**
 * Build styles
 */
require('./index.css').toString();


const CSS_OBJ = Object.freeze({
  colors: {
    default: 'cdx-marker__default',
    blue: 'cdx-marker__blue',
    red: 'cdx-marker__red',
    green: 'cdx-marker__green',
    brown: 'cdx-marker__brown',
    purple: 'cdx-marker__purple',
  },
  hide: 'cdx-marker-hide',
  pallette: 'cdx-marker-pallette',
  button: 'cdx-marker-button',
});

const CSS_ARR = Object.freeze(Object.keys(CSS_OBJ.colors).map(v => CSS_OBJ.colors[v]));


/**
 * Marker Tool for the Editor.js
 *
 * Allows to wrap inline fragment and style it somehow.
 */
class Marker {

  //  f u I do this my way
  // /**
  //  * Class name for term-tag
  //  *
  //  * @type {object}
  //  */
  // static get CSS() {
  //   return CSS_OBJ;
  // };

  /**
   * @param {{api: object, data: object}}  - Editor.js API, data
   */
  constructor({api}) {
    this.api = api;

    /**
     * Toolbar Button
     *
     * @type {HTMLElement|null}
     */
    this.button = null;
    this.pallette = {
      palletteWrapper: null,
      open: false
    };

    /**
     * Tag represented the term
     *
     * @type {string}
     */
    this.tag = 'MARK';

    /**
     * CSS classes
     */
    this.iconClasses = {
      base: this.api.styles.inlineToolButton,
      active: this.api.styles.inlineToolButtonActive
    };
    this.palletteHide = this.palletteHide.bind(this);
  }
  /**
   * Specifies Tool as Inline Toolbar Tool
   *
   * @return {boolean}
   */
  static get isInline() {
    return true;
  }

  /**
   * Create button element for Toolbar
   *
   * @return {HTMLElement}
   */
  render() {
    this.button = document.createElement('button');
    this.button.type = 'button';

    //  so I think you can't call static methods on first render or sth
    this.button.classList.add(this.iconClasses.base, CSS_OBJ.button);  //  really??>..
    this.button.innerHTML = this.toolboxIcon;
    this.button.addEventListener('mouseenter', e => {
      console.log("mouseEnter");
      this.palletteHide(false);
    });
    try {
      this.button.addEventListener('click', e => {
        if (typeof this.api.selection.getCurrentRange !== "function") {
          console.error("Upgrade editorjs to maily version");
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        this.surround(this.api.selection.getCurrentRange(), CSS_OBJ.colors.default, true);
        this.palletteHide(true);
      })
      this.pallette.palletteWrapper = make("div", [CSS_OBJ.hide, CSS_OBJ.pallette]);
      Object.keys(CSS_OBJ.colors).forEach(key => {
        const v = CSS_OBJ.colors[key];
        const element = make("div", [v]);
        element.addEventListener("click", e => {
          e.preventDefault();
          e.stopPropagation();
          this.palletteHide(true);
          this.surround(undefined, v);
        })
        this.pallette.palletteWrapper.appendChild(element);
      });
      this.button.appendChild(this.pallette.palletteWrapper);
    } catch(ex) {
      console.log("<<<<<<<<<<<<<<<<<<<<<<<<exception while init pallette>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
      console.warn(ex);
    }

    return this.button;
  }

  /**
   *
   * @param {boolean} bool
   */
  palletteHide(bool) {
    console.log("palletteHide", bool);
    if (bool) {
      this.pallette.open = true;
      this.pallette.palletteWrapper.classList.add(CSS_OBJ.hide);
    } else {
      this.pallette.open = false;
      this.pallette.palletteWrapper.classList.remove(CSS_OBJ.hide);
    }
  }

  /**
   * Wrap/Unwrap selected fragment
   *
   * @param {Range} range - selected fragment
   * @param {string} className - selected color
   * @param {boolean} forceRemove - force it off or on
   */
  surround(range, className, forceRemove=false) {
    console.log(className, typeof className, forceRemove);
    const refinedRange = range === undefined ? this.api.selection.getCurrentRange() : range;
    if (!refinedRange) {
      return;
    }
    const selectedClass = className ? className : CSS_OBJ.colors.default;

    //  if forceRemove is true ignore class
    if(forceRemove) {
      const wrapper = this.api.selection.findParentTag(this.tag);
      if(wrapper) {
        this.unwrap(wrapper);
        return;
      }
    }

    let termWrapper = this.api.selection.findParentTag(this.tag, selectedClass);

    if (termWrapper) {
      this.unwrap(termWrapper);
    } else {
      this.wrap(refinedRange, selectedClass);
    }
  }

  /**
   * Wrap selection with term-tag
   *
   * @param {Range} range - selected fragment
   * @param {str  ing} selectedClass - class to wrap
   */
  wrap(range, selectedClass) {
    /**
     * Create a wrapper for highlighting
     */
    let marker = document.createElement(this.tag);

    marker.classList.add(selectedClass);

    /**
     * SurroundContent throws an error if the Range splits a non-Text node with only one of its boundary points
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Range/surroundContents}
     *
     * // range.surroundContents(span);
     */
    marker.appendChild(range.extractContents());
    range.insertNode(marker);

    /**
     * Expand (add) selection to highlighted block
     */
    this.api.selection.expandToTag(marker);
  }

  /**
   * Unwrap term-tag
   *
   * @param {HTMLElement} termWrapper - term wrapper tag
   */
  unwrap(termWrapper) {
    /**
     * Expand selection to all term-tag
     */
    this.api.selection.expandToTag(termWrapper);

    let sel = window.getSelection();
    let range = sel.getRangeAt(0);

    let unwrappedContent = range.extractContents();

    /**
     * Remove empty term-tag
     */
    termWrapper.parentNode.removeChild(termWrapper);

    /**
     * Insert extracted content
     */
    range.insertNode(unwrappedContent);

    /**
     * Restore selection
     */
    sel.removeAllRanges();
    sel.addRange(range);
  }

  /**
   * Check and change Term's state for current selection
   */
  checkState() {
    let termTag
    for(let className of CSS_ARR) {
      termTag = this.api.selection.findParentTag(this.tag, className);
      if(!!termTag) break;
    }

    this.button.classList.toggle(this.iconClasses.active, !!termTag);
  }

  /**
   * Get Tool icon's SVG
   * @return {string}
   */
  get toolboxIcon() {
    return require('./../assets/icon.svg').default;
  }

  /**
   * Sanitizer rule
   * @return {{mark: {class: string[]}}}
   */
  static get sanitize() {
    return {
      mark: {
        class: CSS_ARR,
      }
    };
  }
}
/**
 * Helper for making Elements with attributes
 *
 * @param  {string} tagName           - new Element tag name
 * @param  {Array|string} classNames  - list or name of CSS class
 * @param  {object} attributes        - any attributes
 * @returns {Element}
 */
function make(tagName, classNames = null, attributes = {}) {
  const el = document.createElement(tagName);

  if (Array.isArray(classNames)) {
    el.classList.add(...classNames);
  } else if (classNames) {
    el.classList.add(classNames);
  }

  for (const attrName in attributes) {
    el[attrName] = attributes[attrName];
  }

  return el;
};

module.exports = Marker;
