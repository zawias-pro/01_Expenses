interface CategoryFilterProps {
  categories: string[]
  selectedCategory: string | null
  onCategoryChange: (category: string | null) => void
}

const CategoryFilter = ({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.875rem' }}>
        Filter by Category:
      </label>
      <select
        className="form-select"
        value={selectedCategory || ''}
        onChange={e => { onCategoryChange(e.target.value || null) }}
        style={{ fontSize: '0.875rem', padding: '0.375rem', minWidth: '200px' }}
      >
        <option value="">All categories</option>
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
    </div>
  )
}

export { CategoryFilter }
