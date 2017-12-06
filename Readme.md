Question-Effect
===============

![effect screenshot](https://intern.quinscape.de/bitbucket/projects/XCD/repos/q-effect/raw/qfx.jpg?at=refs%2Fheads%2Fmaster)

Question effect for the team17 video (used as mask).

Uses a shapes.svg file to provide the points. The SVG shapes are adaptively linearized by invoking tooling/convert.js which converts the data into a data.js moule.

Uses node/yarn to build the effect.

NPM Scripts
-----------
```json
{
  "scripts": {
    "build": "cross-env NODE_ENV=production webpack -p",
    "build-dev": "cross-env NODE_ENV=development webpack --debug --output-pathinfo",
    "watch": "cross-env NODE_ENV=development webpack --debug --output-pathinfo -w"
  }
}

```

 * `yarn run build` - production build
 * `yarn run build-dev` - dev build
 * `yarn run watch` - dev build with watch mode


CCapture recording
------------------

You can enable CCapture based recording by editing the web/index.html file and remove the comments around the script tag for the CCapture.all.min.js.

It will instrument the JS runtime and record a 60fps version of the current effect until you either press ESC or until 1000 Frames are reached (see HARD_FRAME_LIMIT)

