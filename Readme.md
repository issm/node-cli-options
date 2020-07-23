# node-cli-options

# 概要

# Usage

```js
// example/example.js
const CLIOptions = require('cli-options')

const options = new CLIOptions({
  version: '0.0.1',
  usage: '-r <string> [-f -s <string> -i <integer> -n <number> --ints <v1[,v2,v3...]> --long-name <string>]',
  options: [
    { def: '-r, --required <v>', required: true, description: 'required option' },
    { def: '-f, --flag', description: 'boolean `flag`' },
    { def: '-s, --string <v>', description: 'string `string`' },
    { def: '-t, --patterned-string <v>', pattern: '^.{4}$', description: 'patterned string' },
    { def: '-i, --int <v>', type: 'integer', description: 'integer `int`' },
    { def: '-j, --patterned-int <v>', type: 'integer', pattern: '^[123]$', description: 'patterned integer' },
    { def: '-n, --number <v>', type: 'number', description: 'number `float`' },
    { def: '--ints <vs>', type: 'array:integer', description: 'array of integer `ints`' },
    { def: '--patterned-ints <vs>', type: 'array:integer', pattern: '^[123]$', description: 'array of patterned integer' },
    { def: '--strings <vs>', type: 'array:string', description: 'array of string `strings`' },
    { def: '--patterned-strings <vs>', type: 'array:string', pattern: '^.{3}$', description: 'array of patterned string' },
    { def: '--long-name <v>', type: 'string', description: 'only long-named option' },
    { def: '--default-value <v>', type: 'integer', default: 50, description: 'has default value, if not specified' }
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
```

```terminal
$ node examples/example.js -r 1 -f -i 10.5 -j 3 -s foobar -t abcd -n 1 --ints 1,5,8,10,20 --patterned-ints 1,2,3 --strings aaa,bbb,ccc --patterned-strings aaa,bbb,ccc,ddd --long-name hogefuga arg1 arg2
--------
required: 1
flag: true
string: foobar
patternedString: abcd
int: 10
patternedInt: 3
number: 1
ints: [ 1, 5, 8, 10, 20 ]
patternedInts: [ 1, 2, 3 ]
strings: [ 'aaa', 'bbb', 'ccc' ]
patternedStrings: [ 'aaa', 'bbb', 'ccc', 'ddd' ]
longName: hogefuga
defaultValue: 50
showValidationSchema: undefined
--------
{
  required: '1',
  flag: true,
  string: 'foobar',
  patternedString: 'abcd',
  int: 10,
  patternedInt: '3',
  number: 1,
  ints: [ 1, 5, 8, 10, 20 ],
  patternedInts: [ 1, 2, 3 ],
  strings: [ 'aaa', 'bbb', 'ccc' ],
  patternedStrings: [ 'aaa', 'bbb', 'ccc', 'ddd' ],
  longName: 'hogefuga',
  defaultValue: 50,
  showValidationSchema: undefined
}
--------
[ 'arg1', 'arg2' ]
```
