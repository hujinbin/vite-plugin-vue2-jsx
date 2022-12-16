# vite-plugin-vue2-jsx
Vite plugin for Vue2
* vue文件内自动识别转换<script lang="jsx">
* js文件自动识别转换jsx

## Install

```bash
npm install vite-plugin-vue2-jsx -D
```

```js
// vite.config.js
import { createVuePlugin } from 'vite-plugin-vue2-jsx'

export default {
  plugins: [
    createVuePlugin(/* options */)
  ],
}
```

## [Options]

### `vueTemplateOptions`

Type: `Object`<br>

Default: `{ compilerOptions :{ whitespace: 'condense' }   }`

**Note {  whitespace: 'condense' } behavior**

* 如果元素标签之间的纯空格文本节点包含新行，则它会被删除。否则，它会被压缩成一个单一的空间。

* 非纯空格文本节点内的连续空格被压缩为一个空格。


使用压缩模式将导致更小的编译代码大小和稍微提高性能。但是，在某些情况下，与纯 HTML 相比，它会产生细微的视觉布局差异，如果要保留空白行为，请设置 `{ whitespace: 'preserve' }`

The options for `@vue/component-compiler-utils`.

### `jsx`

Type: `Boolean`<br>
Default: `false`

jsx 转换的选项。

### `jsxOptions`

Type: `Object`<br>

The options for `@vue/babel-preset-jsx`.

### `target`

Type: `String`<br>

esbuild 转换脚本代码的选项