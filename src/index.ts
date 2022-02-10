import { TemplateCompileOptions } from '@vue/component-compiler-utils'
import { normalizeComponentCode } from './utils/componentNormalizer'
import { vueHotReloadCode } from './utils/vueHotReload'
import fs from 'fs'
import { parseVueRequest } from './utils/query'
import { createFilter } from '@rollup/pluginutils'
import { transformMain } from './main'
import { compileSFCTemplate } from './template'
import { getDescriptor } from './utils/descriptorCache'
import { transformStyle } from './style'
import { ViteDevServer, Plugin } from 'vite'
import { SFCBlock } from '@vue/component-compiler-utils'
import { handleHotUpdate } from './hmr'
import { transformVueJsx } from './jsxTransform'

export const vueComponentNormalizer = '\0/vite/vueComponentNormalizer'
export const vueHotReload = '\0/vite/vueHotReload'

// extend the descriptor so we can store the scopeId on it
declare module '@vue/component-compiler-utils' {
  interface SFCDescriptor {
    id: string
  }
}

export interface VueViteOptions {
  include?: string | RegExp | (string | RegExp)[]
  exclude?: string | RegExp | (string | RegExp)[]
  /**
   * The options for `@vue/component-compiler-utils`.
   */
  vueTemplateOptions?: Partial<TemplateCompileOptions>
  /**
   * The options for jsx transform
   * @default false
   */
  jsx?: boolean
  /**
   * The options for `@vue/babel-preset-jsx`
   */
  jsxOptions?: Record<string, any>
  /**
   * The options for esbuild to transform script code
   * @default 'esnext'
   * @example 'esnext' | ['esnext','chrome58','firefox57','safari11','edge16','node12']
   */
  target?: string | string[]
}

export interface ResolvedOptions extends VueViteOptions {
  root: string
  devServer?: ViteDevServer
  isProduction: boolean
  target?: string | string[]
}

export function createVuePlugin(rawOptions: VueViteOptions = {}): Plugin {
  const options: ResolvedOptions = {
    isProduction: process.env.NODE_ENV === 'production',
    ...rawOptions,
    root: process.cwd(),
  }
  const filter = createFilter(options.include || /\.vue$/, options.exclude)
  return {
    name: 'vite-plugin-vue2-jsx',

    config(config) {
      if (options.jsx) {
        return {
          esbuild: {
            include: /\.ts$/,
            exclude: /\.(tsx|jsx)$/,
          },
        }
      }
    },

    handleHotUpdate(ctx) {
      if (!filter(ctx.file)) {
        return
      }
      return handleHotUpdate(ctx, options)
    },

    configResolved(config) {
      options.isProduction = config.isProduction
      options.root = config.root
    },

    configureServer(server) {
      // server.listen = (async (port: number, ...args: any[]) => {
      //   try {
      //     ...
      //     // 依赖预编译
      //     await runOptimize()
      //   } 
      //   ...
      // }) as any
      // console.log(11111111)
      // server.transformWithEsbuild.use((code,id) => {
      //   console.log(code,id)
      //   // 自定义请求处理...
      // })
      options.devServer = server
    },
    // 处理 ES6 的 import 语句，最后需要返回一个模块的 id
    async resolveId(id) {
      if (id === vueComponentNormalizer || id === vueHotReload) {
        return id
      }
      // serve subpart requests (*?vue) as virtual modules
      if (parseVueRequest(id).query.vue) {
        return id
      }
    },

    // 执行每个 rollup plugin 的 load 方法，产出 ast 数据等
    load(id) {
      if (id === vueComponentNormalizer) {
        return normalizeComponentCode
      }

      if (id === vueHotReload) {
        return vueHotReloadCode
      }
  
      const { filename, query } = parseVueRequest(id)
      // select corresponding block for subpart virtual modules
      if (query.vue) {
        if (query.src) {
          return fs.readFileSync(filename, 'utf-8')
        }
        const descriptor = getDescriptor(filename)!
        let block: SFCBlock | null | undefined

        if (query.type === 'script') {
          block = descriptor.script!
        } else if (query.type === 'template') {
          block = descriptor.template!
        } else if (query.type === 'style') {
          block = descriptor.styles[query.index!]
        } else if (query.index != null) {
          block = descriptor.customBlocks[query.index]
        }
        if (block) {
          return {
            code: block.content,
            map: block.map as any,
          }
        }
      }
    },

    async transform(fileCode, id, transformOptions) {
      console.log(fileCode, id)
      let code = fileCode;
      const { filename, query } = parseVueRequest(id)
      if (/\.(vue)$/.test(id)) {
        let hasJsx = false;
        fileCode.replace(/<script.*?>([\s\S]+?)<\/script>/img,(_,js)=>{    //正则匹配出script中的内容
          // 判断script内是否包含jsx语法和是否已加lang="jsx"
          if(/<[^>]+>/.test(js) &&
            /<script.*?>/.test(_) &&
            !(/<script\s*lang=("|')jsx("|').*?>/.test(_))){
            hasJsx = true;
          }
          return js
        });
        if(hasJsx){
          code = fileCode.replace('<script','<script lang="jsx"');
        }
      }
      if (/\.(tsx|jsx)$/.test(id)) {
        return transformVueJsx(code, id, options.jsxOptions)
      }

      // js文件包含jsx语法自动转换
      if (!query.vue && /\.(js)$/.test(id) && /<[^>]+>/.test(code)) {
        return transformVueJsx(code, id, options.jsxOptions)
      }

      if ((!query.vue && !filter(filename)) || query.raw) {
        return
      }

      if (!query.vue) {
        // main request
        return await transformMain(code, filename, options, this)
      }

      const descriptor = getDescriptor(
        query.from ? decodeURIComponent(query.from) : filename
      )!
      // sub block request
      if (query.type === 'template') {
        return compileSFCTemplate(
          code,
          descriptor.template!,
          filename,
          options,
          this
        )
      }
      if (query.type === 'style') {
        return await transformStyle(
          code,
          filename,
          descriptor,
          Number(query.index),
          this
        )
      }
    },
  }
}
