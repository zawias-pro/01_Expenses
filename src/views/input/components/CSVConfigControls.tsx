import { useStore } from '../../../store/useStore.ts'
import { Input } from '../../../components/Input/Input.tsx'
import { Select } from '../../../components/Select/Select.tsx'
import { FormGroup } from "../../../components/FormGroup/FormGroup.tsx"

const CSVConfigControls = () => {
  const delimiter = useStore((state) => state.delimiter)
  const dateIndex = useStore((state) => state.dateIndex)
  const descriptionIndex = useStore((state) => state.descriptionIndex)
  const amountIndex = useStore((state) => state.amountIndex)
  const setDelimiter = useStore((state) => state.setDelimiter)
  const setDateIndex = useStore((state) => state.setDateIndex)
  const setDescriptionIndex = useStore((state) => state.setDescriptionIndex)
  const setAmountIndex = useStore((state) => state.setAmountIndex)

  return (
    <FormGroup>
          <Select
            id="delimiter-select"
            label="CSV Delimiter:"
            value={delimiter}
            onChange={event => { setDelimiter(event.target.value) }}
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
            onChange={e => { setDateIndex(parseInt(e.target.value) || 0) }}
            min="0"
            style={{ marginBottom: 0 }}
          />
          <Input
            id="description-index"
            label="Description Column:"
            type="number"
            value={descriptionIndex}
            onChange={e => { setDescriptionIndex(parseInt(e.target.value) || 0) }}
            min="0"
            style={{ marginBottom: 0 }}
          />
          <Input
            id="amount-index"
            label="Amount Column:"
            type="number"
            value={amountIndex}
            onChange={e => { setAmountIndex(parseInt(e.target.value) || 0) }}
            min="0"
            style={{ marginBottom: 0 }}
          />
    </FormGroup>
  )
}

export { CSVConfigControls }
