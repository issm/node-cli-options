const camelCase = require('camel-case')
const util = require('util')
const Ajv = require('ajv')

const optionConverters = {
  'integer': v => parseInt(v, 10),
  'number': v => parseFloat(v),
  'array': m => v => v.split(',').map(m),
  '_': v => v
}

const schemaTypeMap = {
  'array:integer' (item = {}) {
    return { type: 'array', items: { type: 'integer', ...item } }
  },
  'array:string' (item = {}) {
    return { type: 'array', items: { type: 'string', ...item } }
  }
}

class CLIOptions {
  constructor (params = {}) {
    const c = this._createCommander(params)
    this._applyOptions(c)
    this._applyArgs(c)
    this._validate(c, params.options)
  }

  _createCommander ({ version, usage, options = [] }){
    const c = require('commander')
    if (version) c.version(version)
    if (usage) c.usage(usage)
    options.forEach(opt => {
      const { def, type, required, default: defaultValue, description = '' } = opt
      const converter = this._optionConverter(type)
      const optionMethod = required ? 'requiredOption' : 'option'
      typeof defaultValue !== undefined
        ? c[ optionMethod ](def, description, converter, defaultValue)
        : c[ optionMethod ](def, description, converter)
    })

    // 独自オプション
    c.option('--show-validation-schema', 'バリデーションのための JSON Schema を表示して終了する')

    c.parse(process.argv)
    return c
  }

  _optionConverter (type) {
    let converter
    switch (true) {
      case /^(integer|number)$/.test(type): {
        converter = optionConverters[ type ]
        break
      }
      case /^array:/.test(type): {
        const [ , itemType ] = type.split(':')
        converter = optionConverters[ 'array' ](this._optionConverter(itemType))
        break
      }
      default: {
        converter = optionConverters._
      }
    }
    return converter
  }

  // オプションを，自身のプロパティとして参照できるようにする
  _applyOptions (c) {
    const keys = []
    c.options.forEach(opt => {
      const k = (typeof opt.long === 'undefined' ? opt.short : opt.long).replace(/^-+/, '')
      // `version` はオプション情報へ加えない
      if (k === 'version') { return }
      const kcc = camelCase(k)
      Object.defineProperty(this, kcc, { get: () => c[ kcc ] })
      keys.push(kcc)
    })
    Object.defineProperty(this, 'keys', { get: () => keys })
  }

  // `args` プロパティを，引数リストを取得するための getter として適用する
  _applyArgs (c) {
    Object.defineProperty(this, 'args', { get: () => c.args })
  }

  // オプション情報をまるごと返す
  get options () {
    const options = {}
    this.keys.forEach(k => {
      options[ k ] = this[ k ]
    })
    return options
  }

  // 自身のバリデーションを行う
  _validate (c, optionDefs) {
    const schema = this._constructValidationSchema(c, optionDefs)

    // `--show-validation-schema` オプション指定時，スキーマを表示してプロセスを終了する
    if (this.showValidationSchema) {
      console.log(util.inspect(schema, { depth: 10, colors: true }))
      process.exit(0)
      return
    }

    const v = new Ajv()
    const isValid = v.validate(schema, this.options)
    if (!isValid) {
      console.error(v.errors)
      const err = new Error('Validation failure')
      err.code = 'ValidationFailure'
      err.errors = v.errors
      throw err
    }
  }

  _constructValidationSchema (c, optionDefs) {
    // schema を組み立てる
    const schemaRequired = []
    const schemaProperties = {}
    c.options.forEach(opt => {
      const { flags, required, mandatory, long, short, description = '' } = opt
      const [ optionDef ] = optionDefs.filter(od => od.def === flags)
      // optionDef が未定義であれば，commander によって追加されたオプションであるので，スキップする
      if (!optionDef) return

      // オプション名
      const name = camelCase((typeof long === 'undefined' ? short : long).replace(/^-+/, ''))

      // schema.required[] に追加
      if (mandatory) schemaRequired.push(name)

      let { type, pattern } = optionDef
      if (!type) {
        // type が指定されていない場合，推測する
        // opt.required は「そのオプションが値を必要とするかどうか」を意味するので，それを利用する
        type = required ? 'string' : 'boolean'
      }

      // schema.properties に追加
      let schemaProperty
      if (schemaTypeMap[ type ]) {
        schemaProperty = pattern
          ? schemaTypeMap[ type ]({ pattern })
          : schemaTypeMap[ type ]()
      } else {
        schemaProperty = pattern
          ? { type, pattern, description }
          : { type, description }
      }
      schemaProperties[ name ] = schemaProperty
    })
    const schema = { required: schemaRequired, properties: schemaProperties }
    return schema
  }
}

module.exports = CLIOptions
