type CsvPreset = {
  name: string
  source: string
}

const presets: CsvPreset[] = [
  {
    name: 'Example 1',
    source: `TEST-0001;10.00
TEST-0002;20,00
TEST-0003;30.50
TEST-0004;40,25
TEST-0005;50
TEST-0006;60.99
TEST-0007;70,10
TEST-0008;80
TEST-0009;90.05
TEST-0010;100,00`,
  },
  {
    name: 'Example 2',
    source: `item,amount,currency
dummy1,1.00,eur
dummy2,2,50,usd
dummy3,3.25,pln
dummy4,4,75,pln
dummy5,5,eur
dummy6,6.50,usd
dummy7,7,25,pln
dummy8,8.00,eur
dummy9,9,75,pln
dummy10,missing,usd`,
  },
  {
    name: 'Example 3',
    source: `definitely a description;12.5
;42.00
"quoted, comma thing";  7
no num here
xx;;yy;99
"unterminated
foo;bar
1item;2
;;;
last;0,99`,
  },
]

export { presets }