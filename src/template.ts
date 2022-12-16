import type { SFCBlock } from '@vue/component-compiler-utils'
import * as vueTemplateCompiler from 'vue-template-compiler'
import type { TransformPluginContext } from 'rollup'
import hash from 'hash-sum'
import { createRollupError } from './utils/error'
import { compileTemplate } from './template/compileTemplate'
import type { ResolvedOptions } from './index'

export function compileSFCTemplate(
  source: string,
  block: SFCBlock,
  filename: string,
  { isProduction, vueTemplateOptions = {} }: ResolvedOptions,
  pluginContext: TransformPluginContext,
) {
  const { tips, errors, code } = compileTemplate({
    source,
    filename,
    compiler: vueTemplateCompiler as any,
    transformAssetUrls: true,
    transformAssetUrlsOptions: {
      forceRequire: true,
    },
    isProduction,
    isFunctional: !!block.attrs.functional,
    optimizeSSR: false,
    prettify: false,
    preprocessLang: block.lang,
    ...vueTemplateOptions,
    compilerOptions: {
      whitespace: 'condense',
      ...(vueTemplateOptions.compilerOptions || {}),
    },
  })

  if (tips) {
    tips.forEach(warn =>
      pluginContext.warn({
        id: filename,
        message: typeof warn === 'string' ? warn : warn.msg,
      }),
    )
  }

  if (errors) {
    const generateCodeFrame = (vueTemplateCompiler as any).generateCodeFrame
    errors.forEach((error) => {
      // 2.6 compiler outputs errors as objects with range
      if (
        generateCodeFrame
        && vueTemplateOptions.compilerOptions?.outputSourceRange
      ) {
        const { msg, start, end } = error as vueTemplateCompiler.ErrorWithRange
        return pluginContext.error(
          createRollupError(filename, {
            message: msg,
            frame: generateCodeFrame(source, start, end),
          }),
        )
      }
      else {
        pluginContext.error({
          id: filename,
          message: typeof error === 'string' ? error : error.msg,
        })
      }
    })
  }

  // rewrite require calls to import on build
  return {
    code:
      `${transformRequireToImport(code)}\nexport { render, staticRenderFns }`,
    map: null,
  }
}

export function transformRequireToImport(code: string): string {
  const imports: Record<string, string> = {}
  let strImports = ''

  code = code.replace(
    /require\(("(?:[^"\\]|\\.)+"|'(?:[^'\\]|\\.)+')\)/g,
    (_, name): any => {
      if (!(name in imports)) {
        // #81 compat unicode assets name
        imports[name] = `__$_require_${hash(name)}__`
        strImports += `import ${imports[name]} from ${name}\n`
      }

      return imports[name]
    },
  )

  return strImports + code
}
