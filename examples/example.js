const CLIOptions = require('../')

async function main () {
  const options = new CLIOptions({
    version: '0.0.1',
    usage: '-r <string> [-f -s <string> -i <integer> -n <number> --ints <v1[,v2,v3...]> --long-name <string>]',
    options: [
      { def: '-r, --required <v>', required: true, description: 'required option' },
      { def: '-f, --flag', description: 'boolean `flag`' },
      { def: '-s, --string <v>', description: 'string `string`' },
      { def: '-i, --int <v>', type: 'integer', description: 'integer `int`' },
      { def: '-n, --number <v>', type: 'number', description: 'number `float`' },
      { def: '--ints <vs>', type: 'array:integer', description: 'array of integer `ints`' },
      { def: '--long-name <v>', type: 'string', description: 'only long-named option' }
    ]
  })

  console.log('--------')
  options.keys.forEach(key => {
    console.log(`${key}:`, options[ key ])
  })
  console.log('--------')
  console.log(options.options)
  console.log('--------')
  console.log(options.args)
}

main()
