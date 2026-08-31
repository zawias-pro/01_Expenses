type CsvPreset = {
  name: string
  source: string
}

const presets: CsvPreset[] = [
  {
    name: 'Example 1',
    source: `TEST-0001;10
TEST-0002;20
TEST-0003;30
TEST-0004;40
TEST-0005;50
TEST-0006;60
TEST-0007;70
TEST-0008;80
TEST-0009;90
TEST-0010;100`,
  },
  {
    name: 'Example 2',
    source: `item,amount,currency
dummy1,1,eur
dummy2,2,usd
dummy3,3,pln
dummy4,4,pln
dummy5,5,eur
dummy6,6,usd
dummy7,7,pln
dummy8,8,eur
dummy9,9,pln
dummy10,missing,usd`,
  },
  {
    name: 'Example 3',
    source: `definitely a description;12.5
;42
"quoted, comma thing";  7
no num here
xx;;yy;99
"unterminated
foo;bar
1item;2
;;;
last;0`,
  },
]

export { presets }