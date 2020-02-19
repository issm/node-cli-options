const camelCase = require('camel-case')

const optionConverters = {
  'integer': v => parseInt(v, 10),
  'number': v => parseFloat(v),
  'array': m => v => v.split(',').map(m),
  '_': v => v
}

class CLIOptions {
  constructor (params = {}) {
    const c = this._createCommander(params)
    this._applyOptions(c)
  }

  _createCommander ({ version, usage, options = [] }){
    const c = require('commander')
    if (version) c.version(version)
    if (usage) c.usage(usage)
    options.forEach(opt => {
      const { def, type, description = '' } = opt
      const converter = this._optionConverter(type)
      c.option(def, description, converter)
    })
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

  // オプション情報をまるごと返す
  get options () {
    const options = {}
    this.keys.forEach(k => {
      options[ k ] = this[ k ]
    })
    return options
  }
}

module.exports = CLIOptions
