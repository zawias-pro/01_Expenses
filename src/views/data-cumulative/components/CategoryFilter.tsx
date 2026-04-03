import { Select } from '../../../components/Select/Select.tsx'
import { NO_CATEGORY_ID } from '../../../parsing/types.ts'
import { useStore } from "../../../store/useStore.ts"

const CategoryFilter = ({
  selectedCategory,
  onCategoryChange
}: {
  selectedCategory: string | null
  onCategoryChange: (category: string | null) => void
}) => {
  const categoryMetadata = useStore((state) => state.categoryMetadata)

  const getCurrentValue = () => {
    if(selectedCategory === null) {return '[all]'}
    return selectedCategory
  }
  return (
    <div>
      <Select
        id="category-filter"
        label="Category"
        value={getCurrentValue()}
        onChange={e => {
          if (e.target.value === '[all]') {
            onCategoryChange(null)
            return
          }
          onCategoryChange(e.target.value)
        }}
        >
          <option value="[all]">All categories</option>
          <option value={NO_CATEGORY_ID}>No category</option>
          {Object.entries(categoryMetadata).map(([id,name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
      </Select>
    </div>
  )
}

export { CategoryFilter }
