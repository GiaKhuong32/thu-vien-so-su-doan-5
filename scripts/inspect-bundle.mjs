import fs from 'node:fs'

const s = fs.readFileSync('D:/thuvienso/client/thuvienso-public/assets/index-DcJHLpnm.js', 'utf8')
const lines = s.split('\n')

function count(re) {
  return (s.match(re) || []).length
}

console.log({
  catchBare: count(/catch\{/g),
  optionalChain: count(/\?\./g),
  nullish: count(/\?\?/g),
  logicalOrEq: count(/\|\|=/g),
  privateMethod: count(/#[A-Za-z_]/g),
  importMeta: count(/import\.meta/g),
  nestedTpl: count(/\$\{[^}]*`/g),
})

const sample = []
const re = /\$\{[^}]{0,80}`/g
let m
let n = 0
while ((m = re.exec(s)) && n < 8) {
  sample.push(JSON.stringify(m[0]).slice(0, 120))
  n++
}
console.log('nested samples', sample)

const l1 = lines[0]
console.log('line1 has u003c', l1.includes('\\u003c'))
console.log('line1 first u003c idx', l1.indexOf('\\u003c'))
console.log('line1 length', l1.length)
console.log('u003c near start', l1.slice(Math.max(0, l1.indexOf('\\u003c') - 40), l1.indexOf('\\u003c') + 50))
