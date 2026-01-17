import { Input } from '../../../components/Input/Input.tsx'
import { Select } from '../../../components/Select/Select.tsx'

interface CSVConfigControlsProps {
  delimiter: string
  dateIndex: number
  descriptionIndex: number
  amountIndex: number
  onDelimiterChange: (delimiter: string) => void
  onDateIndexChange: (index: number) => void
  onDescriptionIndexChange: (index: number) => void
  onAmountIndexChange: (index: number) => void
}

const CSVConfigControls = ({
  delimiter,
  dateIndex,
  descriptionIndex,
  amountIndex,
  onDelimiterChange,
  onDateIndexChange,
  onDescriptionIndexChange,
  onAmountIndexChange
}: CSVConfigControlsProps) => {
  return (
    <div className="form-group">
      <div className="form-group-row">
        <div className="form-group">
          <Select
            id="delimiter-select"
            label="CSV Delimiter:"
            value={delimiter}
            onChange={e => { onDelimiterChange(e.target.value) }}
            style={{ marginBottom: 0 }}
          >
            <option value=";">Semicolon (;)</option>
            <option value=",">Comma (,)</option>
            <option value="\t">Tab</option>
            <option value="|">Pipe (|)</option>
          </Select>
        </div>
        <div className="form-group-small">
          <Input
            id="date-index"
            label="Date Column:"
            type="number"
            value={dateIndex}
            onChange={e => { onDateIndexChange(parseInt(e.target.value) || 0) }}
            min="0"
            style={{ marginBottom: 0 }}
          />
        </div>
        <div className="form-group-small">
          <Input
            id="description-index"
            label="Description Column:"
            type="number"
            value={descriptionIndex}
            onChange={e => { onDescriptionIndexChange(parseInt(e.target.value) || 0) }}
            min="0"
            style={{ marginBottom: 0 }}
          />
        </div>
        <div className="form-group-small">
          <Input
            id="amount-index"
            label="Amount Column:"
            type="number"
            value={amountIndex}
            onChange={e => { onAmountIndexChange(parseInt(e.target.value) || 0) }}
            min="0"
            style={{ marginBottom: 0 }}
          />
        </div>
      </div>
    </div>
  )
}

export { CSVConfigControls }
