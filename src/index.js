/**
 * Build styles
 */
require('./index.css').toString();

/**
 * Marker Tool for the CodeX Editor
 *
 * Allows to select and unselect separate symbols of text fragment and style them somehow.
 */
class Marker {
    /**
     * @param {{api: object}}  - CodeX Editor API
     */
    constructor({api}) {
        this.api = api;

        /**
         * Toolbar Button
         *
         * @type {HTMLElement|null}
         */
        this.button = null;

        /**
         * Tag represented the term
         *
         * @type {string}
         */
        this.tag = 'SPAN';

        /**
         * Class name for term-tag
         *
         * @type {string}
         */
        this.CSS = 'marker';

        /**
         * CSS classes
         */
        this.iconClasses = {
            base: this.api.styles.inlineToolButton,
            active: this.api.styles.inlineToolButtonActive
        };
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
        this.button.classList.add(this.iconClasses.base);
        this.button.innerHTML = this.toolboxIcon;

        return this.button;
    }

    /**
     * Wrap/Unwrap selected fragment
     *
     * @param {Range} range - selected fragment
     */
    surround(range) {
        if (!range) {
            return;
        }

        let termWrapper = this.api.selection.findParentTag(this.tag, this.CSS);

        /**
         * If start or end of selection is in the highlighted block
         */
        if (termWrapper) {
            this.unwrap(termWrapper);
        } else {
            this.wrap(range);
        }
    }

    /**
     * Wrap selection with term-tag
     *
     * @param {Range} range - selected fragment
     */
    wrap(range) {
        /**
         * Create a wrapper for highlighting
         */
        let span = document.createElement(this.tag);

        span.classList.add(this.CSS);

        /**
         * SurroundContent throws an error if the Range splits a non-Text node with only one of its boundary points
         * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Range/surroundContents}
         *
         * // range.surroundContents(span);
         */
        span.appendChild(range.extractContents());
        range.insertNode(span);

        /**
         * Expand (add) selection to highlighted block
         */
        this.api.selection.expandToTag(span);
    }

    /**
     * Unwrap term-tag
     *
     * @param {HTMLElement} termWrapper - term wrapper tag
     */
    unwrap(termWrapper) {
        /**
         * Capture new selection
         */
        let newSel = window.getSelection();
        let newRange = newSel.getRangeAt(0);

        /**
         * Expand selection to all term-tag
         */
        this.api.selection.expandToTag(termWrapper);

        /**
         * Select all previously marked text
         */
        let oldSel = window.getSelection();
        let oldRange = oldSel.getRangeAt(0);

        /**
         * Convert ranges to strings to compare
         */
        let rangeString = oldRange.toString();
        let newRangeString = newRange.toString();

        /**
         * Text to unselect must be inside old selection
         */
        let selectionIsInside = newRange.compareBoundaryPoints(Range.START_TO_START, oldRange) >= 0 && oldRange.compareBoundaryPoints(Range.END_TO_END, newRange);

        /**
         * Check if new selection and previously marked area are the same
         */
        if (newRangeString.localeCompare(rangeString) === 0) {
            /**
             * If new selection and marked area are the same expand selection to all term-tag
             */
            let unwrappedContent = oldRange.extractContents();

            /**
             * Remove empty term-tag
             */
            termWrapper.parentNode.removeChild(termWrapper);

            /**
             * Insert extracted content
             */
            oldRange.insertNode(unwrappedContent);
        } else if (selectionIsInside) {
            /**
             * If new selection and previously marked area are not the same
             *                   get content before and after new selection
             */
            let selectionBefore = rangeString.slice(0, newRange.startOffset);
            let selectionAfter = rangeString.slice(newRange.endOffset);

            /**
             * Remove empty term-tag
             */
            termWrapper.parentNode.removeChild(termWrapper);

            /**
             * Prevents from inserting marked span with no content after unselected text
             */
            if (selectionAfter !== '') {
                let spanAfter = document.createElement(this.tag);

                spanAfter.classList.add(this.CSS);
                spanAfter.textContent = selectionAfter;
                oldRange.insertNode(spanAfter);
            }

            /**
             * Insert unselected content
             */
            let unselectedContent = document.createElement(this.tag);

            unselectedContent.textContent = newRangeString;
            oldRange.insertNode(unselectedContent);

            /**
             * Prevents from inserting marked span with no content before unselected text
             */
            if (selectionBefore !== '') {
                let spanBefore = document.createElement(this.tag);

                spanBefore.classList.add(this.CSS);
                spanBefore.textContent = selectionBefore;
                oldRange.insertNode(spanBefore);
            }
        }

        /**
         * Restore selection
         */
        oldSel.removeAllRanges();
    }

    /**
     * Check and change Term's state for current selection
     */
    checkState() {
        const termTag = this.api.selection.findParentTag(this.tag, this.CSS);

        this.button.classList.toggle(this.iconClasses.active, !!termTag);
    }

    /**
     * Get Tool icon's SVG
     * @return {string}
     */
    get toolboxIcon() {
        return '<svg width="20" height="18"> <path d="M10.458 12.04l2.919 1.686-.781 1.417-.984-.03-.974 1.687H8.674l1.49-2.583-.508-.775.802-1.401zm.546-.952l3.624-6.327a1.597 1.597 0 0 1 2.182-.59 1.632 1.632 0 0 1 .615 2.201l-3.519 6.391-2.902-1.675zm-7.73 3.467h3.465a1.123 1.123 0 1 1 0 2.247H3.273a1.123 1.123 0 1 1 0-2.247z"/> </svg>'
    }
}

module.exports = Marker;