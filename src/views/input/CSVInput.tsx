import { useState } from 'react'
import { parseCSVLine } from '../../parsing/parseCSVLine/parseCSVLine.ts'
import { classifyDescription } from '../../parsing/classifyDescription/classifyDescription.ts'
import type { Transaction } from '../../parsing/types.ts'
import { useStore, useAllRules } from '../../store/useStore.ts'
import { CSVPreviewTable } from './components/CSVPreviewTable.tsx'
import { SectionHeader } from '../../components/SectionHeader/SectionHeader.tsx'
import { Button } from '../../components/Button/Button.tsx'
import { EXAMPLE_CSV } from './exampleCsv.ts'
import { Textarea } from "../../components/Textarea/Textarea.tsx"
import { Panel } from "../../components/Panel/Panel.tsx"
import { Select } from "../../components/Select/Select.tsx"
import { Input } from "../../components/Input/Input.tsx"
import { FormGroup } from "../../components/FormGroup/FormGroup.tsx"
import { addTransactions } from "./addTransactions.ts"

const CSVInput = () => {
  const [csvContent, setCsvContent] = useState('')
  const [delimiter, setDelimiter] = useState(';')
  const [dateIndex, setDateIndex] = useState(0)
  const [descriptionIndex, setDescriptionIndex] = useState(1)
  const [amountIndex, setAmountIndex] = useState(4)
  const transactions = useStore((state) => state.transactions)
  const setTransactions = useStore((state) => state.setTransactions)
  const allRules = useAllRules()

  const getPreviewTransactions = (): Transaction[] => {
    if (csvContent.trim()==='') return []

    const lines = csvContent.trim().split('\n')
    return lines.map(line => {
      const parsed = parseCSVLine(line, delimiter, dateIndex, descriptionIndex, amountIndex)
      return {
        ...parsed,
        category: classifyDescription(parsed.description, allRules)
      }
    })
  }

  const handleFillExample = () => {
    setCsvContent(EXAMPLE_CSV)
  }

  return (
    <>
      <SectionHeader>
        CSV Input
      </SectionHeader>
      <Panel>
        <p>
          Paste CSV data below to add transactions. Transactions will be appended, not replaced.
        </p>
        <FormGroup>
          <Select
            id="delimiter-select"
            label="Delimiter"
            value={delimiter}
            onChange={event => { setDelimiter(event.target.value) }}
          >
            <option value=";">Semicolon (;)</option>
            <option value=",">Comma (,)</option>
            <option value="\t">Tab</option>
            <option value="|">Pipe (|)</option>
          </Select>
          <Input
            id="date-index"
            label="Date column"
            type="number"
            value={dateIndex}
            onChange={e => { setDateIndex(parseInt(e.target.value)) }}
            min="0"
          />
          <Input
            id="description-index"
            label="Description column"
            type="number"
            value={descriptionIndex}
            onChange={e => { setDescriptionIndex(parseInt(e.target.value)) }}
            min="0"
          />
          <Input
            id="amount-index"
            label="Amount column"
            type="number"
            value={amountIndex}
            onChange={e => { setAmountIndex(parseInt(e.target.value) || 0) }}
            min="0"
          />
        </FormGroup>
          <Textarea
            id={'csv'}
            label={'CSV'}
            value={csvContent}
            onChange={e => {setCsvContent(e.target.value)}}
            rows={10}
          />
      </Panel>
      <Panel title={'Preview'}>
        <CSVPreviewTable transactions={getPreviewTransactions()} />
      </Panel>
      <div className="action-buttons">
        <Button onClick={handleFillExample}>
          Fill with example data
        </Button>
        <Button
          onClick={() => {
            addTransactions(
              csvContent,
              setCsvContent,
              setTransactions,
              transactions,
              delimiter,
              dateIndex,
              descriptionIndex,
              amountIndex,
              allRules
            )
          }}
          disabled={csvContent.trim()===''}
        >
          Add transactions
        </Button>
      </div>
    </>
  )
}

export { CSVInput }
