![](https://badgen.net/badge/Editor.js/v2.0/blue)

# Marker Tool

Marker Tool for highlighting text-fragments for the [Editor.js](https://editorjs.io).

![](assets/example.gif)

## Installation

Get the package

```shell
yarn add @editorjs/marker
```

Include module at your application

```javascript
import Marker from '@editorjs/marker';
```

Optionally, you can load this tool from CDN [JsDelivr CDN](https://cdn.jsdelivr.net/npm/@editorjs/marker@latest)

## Usage

Add a new Tool to the `tools` property of the Editor.js initial config.

```javascript
var editor = EditorJS({
  ...
  
  tools: {
    ...
    Marker: {
      class: Marker,
      shortcut: 'CMD+SHIFT+M',
    }
  },
  
  ...
});
```

## Config Params

This Tool has no config params

## Output data

Marked text will be wrapped with a `mark` tag with an `cdx-marker` class.

```json
{
    "type" : "text",
    "data" : {
        "text" : "Create a directory for your module, enter it and run <mark class=\"cdx-marker\">npm init</mark> command."
    }
}
```

