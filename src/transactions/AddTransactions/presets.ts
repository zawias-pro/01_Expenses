type CsvPreset = {
  name: string
  source: string
}

const presets: CsvPreset[] = [
  {
    name: 'Example 1',
    source: `TEST-0001;10.00;2026-01-01
TEST-0002;20,00;2026-01-02
TEST-0003;30.50;2026-01-03
TEST-0004;40,25;2026-01-04
TEST-0005;50;2026-01-05
TEST-0006;60.99;2026-01-06
TEST-0007;70,10;2026-01-07
TEST-0008;80;2026-01-08
TEST-0009;90.05;2026-01-09
TEST-0010;100,00;2026-01-10`,
  },
  {
    name: 'Example 2',
    source: `item,amount,date
dummy1,1.00,2026-02-01
dummy2,2,50,2026-02-02
dummy3,3.25,2026-02-03
dummy4,4,75,2026-02-04
dummy5,5,2026-02-05
dummy6,6.50,2026-02-06
dummy7,7,25,2026-02-07
dummy8,8.00,2026-02-08
dummy9,9,2026-02-09
dummy10,missing,2026-02-10`,
  },
  {
    name: 'Example 3',
    source: `definitely a description;12.5;2026-03-01
;42.00;2026-03-02
"quoted, comma thing";  7;3/5/2026
no num here
xx;;yy;99
"unterminated
foo;bar;5 Mar 2026
1item;2;2026
;;;
last;0,99;not-a-date`,
  },
]

export { presets }