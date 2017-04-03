[![Build Status](https://travis-ci.org/manhhailua/arf.svg?branch=master)](https://travis-ci.org/manhhailua/arf)

# Advertisement Rendering Framework (ARF)

**Vuejs** + **Babel** + **Webpack** + **Gulp** based framework for rendering ads on your websites.

## Features

* Reactive render advertisement with [Vue.js](https://vuejs.org)
* Polyfill with Babel.

*Have in mind that you have to build your library before publishing. The files under the `build` folder are the ones that should be distributed.*

## Installation

This library is currently available on `npm`.

```
$ npm install arf --save
```

## Usage

#### Sync guide

#####1. Implement the framework, put this line of code on your `head` tag
```
<script src="path/to/your/arf.min.js"></script>
```

#####2. Add a banner container to your document `body`
```
<banner id="my-banner"></banner>
<script>
  new Arf.Banner({
    el: '#my-banner',
    propsData: {
      model: {
        id: 'leader-board',
        html: '<p>This is a top banner</p>',
        width: 468,
        height: 90,
      }
    }
  });
</script>
```

If you have already known [Vue.js](https://vuejs.org), you will recognize the above syntax. `Arf.Banner` is an instance of [Vue.component](https://vuejs.org/v2/guide/components.html#ad) , so `Arf.Banner` has every features which Vue.component supplies.

#### Async guide

This is one of the best features of ARF. You can define your ads every where you want then asynchronously implement ARF at the bottom of `body` tag. Your banners will wait in queue till ARF is defined. When ARF is defined, ARF will fetch through the queue then render all the banner the queue containing.

#####1. Define a banner:
ARF handles two queues: `window.arfBannersQueue` & `window.arfZonesQueue`. `window.arfZonesQueue` is for advanced usages with sharing a space for multiple banners. If you just want to put an ads to your site/app, `window.arfBannersQueue` is all you need.
```
<banner id="my-banner"></banner>
<script>
  // Init arfBannersQueue if not existed
  window.arfBannersQueue = window.arfBannersQueue || [];

  // Push current banner to arfBannersQueue
  window.arfBannersQueue.push({
    el: '#my-banner',
    propsData: {
      model: {
        id: 'leader-board',
        html: '<p>This is a top banner</p>',
        width: 468,
        height: 90,
      }
    }
  });
</script>
```
#####2. Put ARF before your `</body>`
```
<script src="path/to/your/arf.min.js"></script>
```
ARF watches the above two queues for changes then render all ads pushed to queues.

## Development guide

ARF welcome all contributions from community. `Node.js v5` is require as minimum.

1. Build your library
  * Run `npm install` to get the project's dependencies
  * Run `npm run build` to produce your library (outputs are three version of your library: development, production).
2. Development mode
  * Having all the dependencies installed run `npm start` or `npm run develop`. This command will watch the `src` folder and regenerate all versions of your library so you get the compilation on file change.
3. Running the tests
  * Run `npm run test`

## Scripts

* `npm run develop` - produces all versions of your library and template in watcher mode
* `npm run build` - produces all versions of your library and template once
* `npm run test` - well ... it runs the tests :)
