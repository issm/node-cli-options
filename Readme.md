# node-cli-options

# 概要

# Usage

```js
const CLIOptions = require('cli-options')

const options = new CLIOptions({
  version: '0.0.1',
  usage: '-f -s <string> -i <integer> -n <number> --ints <v1[,v2,v3...]> --long-name <string>',
  options: [
    { def: '-f, --flag', description: 'boolean `flag`' },
    { def: '-s --string <v>', description: 'string `string`' },
    { def: '-i, --int <v>', type: 'integer', description: 'integer `int`' },
    { def: '-n, --number <v>', type: 'number', description: 'number `float`' },
    { def: '--ints <v1[,v2,v3,...]>', type: 'array:integer', description: 'array of integer `ints`' },
    { def: '--long-name <v>', type: 'string', description: 'long-named option' }
  ]
})

options.keys.forEach(key => {
  console.log(`${key}:`, options[ key ])
})

console.log(options.options)
```
