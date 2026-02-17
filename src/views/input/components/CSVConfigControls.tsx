import { Input } from '../../../components/Input/Input.tsx'
import { Select } from '../../../components/Select/Select.tsx'
import { FormGroup } from "../../../components/FormGroup/FormGroup.tsx"

const CSVConfigControls = ({
  delimiter,
  dateIndex,
  descriptionIndex,
  amountIndex,
  onDelimiterChange,
  onDateIndexChange,
  onDescriptionIndexChange,
  onAmountIndexChange,
}: {
  delimiter: string
  dateIndex: number
  descriptionIndex: number
  amountIndex: number
  onDelimiterChange: (value: string) => void
  onDateIndexChange: (value: number) => void
  onDescriptionIndexChange: (value: number) => void
  onAmountIndexChange: (value: number) => void
}) => {
  return (
    <FormGroup>
      <Select
        id="delimiter-select"
        label="CSV Delimiter:"
        value={delimiter}
        onChange={event => { onDelimiterChange(event.target.value) }}
        style={{ marginBottom: 0 }}
      >
        <option value=";">Semicolon (;)</option>
        <option value=",">Comma (,)</option>
        <option value="\t">Tab</option>
        <option value="|">Pipe (|)</option>
      </Select>
      <Input
        id="date-index"
        label="Date Column:"
        type="number"
        value={dateIndex}
        onChange={e => { onDateIndexChange(parseInt(e.target.value) || 0) }}
        min="0"
        style={{ marginBottom: 0 }}
      />
      <Input
        id="description-index"
        label="Description Column:"
        type="number"
        value={descriptionIndex}
        onChange={e => { onDescriptionIndexChange(parseInt(e.target.value) || 0) }}
        min="0"
        style={{ marginBottom: 0 }}
      />
      <Input
        id="amount-index"
        label="Amount Column:"
        type="number"
        value={amountIndex}
        onChange={e => { onAmountIndexChange(parseInt(e.target.value) || 0) }}
        min="0"
        style={{ marginBottom: 0 }}
      />
    </FormGroup>
  )
}

export { CSVConfigControls }
