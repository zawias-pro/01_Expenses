import { Select } from '../../../components/Select/Select.tsx'

interface CategoryFilterProps {
  categories: string[]
  selectedCategory: string | null
  onCategoryChange: (category: string | null) => void
}

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <div>
      <Select
        id="category-filter"
        label="Category"
        value={selectedCategory || ''}
        onChange={e => { onCategoryChange(e.target.value || null) }}
      >
        <option value="">All categories</option>
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </Select>
    </div>
  )
}

export { CategoryFilter }
