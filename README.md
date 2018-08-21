![](https://badgen.net/badge/CodeX%20Editor/v2.0/blue)

# Marker Tool

Marker Tool for marking code-fragments for the [CodeX Editor](https://ifmo.su/editor).

![](assets/example.gif)

## Installation

### Install via NPM

Get the package

```shell
npm i --save-dev codex.editor.marker
```

Include module at your application

```javascript
const Marker = require('codex.editor.marker');
```

### Download to your project's source dir

1. Upload folder `dist` from repository
2. Add `dist/bundle.js` file to your page.

### Load from CDN

You can load specific version of package from [jsDelivr CDN](https://www.jsdelivr.com/package/npm/codex.editor.marker).

`https://cdn.jsdelivr.net/npm/codex.editor.marker@1.0.1`

Require this script on a page with CodeX Editor.

```html
<script src="..."></script>
```

## Usage

Add a new Tool to the `tools` property of the CodeX Editor initial config.

```javascript
var editor = CodexEditor({
  ...
  
  tools: {
    ...
    Marker: {
      class: Marker,
      shortcut: 'CMD+SHIFT+A',
    },
  },
  
  ...
});
```

## Config Params

This Tool has no config params

## Output data

Marked text will be wrapped with a `span` tag with an `marker` class.

```json
{
    "type" : "text",
    "data" : {
        "text" : "Create a directory for your module, enter it and run <span class=\"marker\">npm init</span> command."
    }
}
```

