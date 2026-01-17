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
          <label htmlFor="delimiter-select" className="form-label">
            CSV Delimiter:
          </label>
          <select
            id="delimiter-select"
            className="form-select"
            value={delimiter}
            onChange={e => { onDelimiterChange(e.target.value) }}
          >
            <option value=";">Semicolon (;)</option>
            <option value=",">Comma (,)</option>
            <option value="\t">Tab</option>
            <option value="|">Pipe (|)</option>
          </select>
        </div>
        <div className="form-group-small">
          <label htmlFor="date-index" className="form-label">
            Date Column:
          </label>
          <input
            id="date-index"
            type="number"
            className="form-input"
            value={dateIndex}
            onChange={e => { onDateIndexChange(parseInt(e.target.value) || 0) }}
            min="0"
          />
        </div>
        <div className="form-group-small">
          <label htmlFor="description-index" className="form-label">
            Description Column:
          </label>
          <input
            id="description-index"
            type="number"
            className="form-input"
            value={descriptionIndex}
            onChange={e => { onDescriptionIndexChange(parseInt(e.target.value) || 0) }}
            min="0"
          />
        </div>
        <div className="form-group-small">
          <label htmlFor="amount-index" className="form-label">
            Amount Column:
          </label>
          <input
            id="amount-index"
            type="number"
            className="form-input"
            value={amountIndex}
            onChange={e => { onAmountIndexChange(parseInt(e.target.value) || 0) }}
            min="0"
          />
        </div>
      </div>
    </div>
  )
}

export { CSVConfigControls }
