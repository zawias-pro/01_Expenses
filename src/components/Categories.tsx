import { useState } from 'react'

const Categories = ({
  rules,
  baseRules,
  customRules,
  onAddRule,
  onRemoveRule
}: {
  rules: Record<string, string>
  baseRules: Record<string, string>
  customRules: Record<string, string>
  onAddRule: (keyword: string, category: string) => void
  onRemoveRule: (keyword: string) => void
}) => {
  const [newKeyword, setNewKeyword] = useState('')
  const [newCategory, setNewCategory] = useState('')

  const handleAddRuleClick = () => {
    if (newKeyword.trim() && newCategory.trim()) {
      onAddRule(newKeyword.trim(), newCategory.trim())
      setNewKeyword('')
      setNewCategory('')
    }
  }

  const isBaseRule = (keyword: string) => keyword in baseRules
  const isCustomRule = (keyword: string) => keyword in customRules

  return (
    <div>
      <h2>Custom Categories</h2>
      
      <div>
        <h3>Expense Categories</h3>
        <div>
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Keyword</th>
                <th>Category</th>
                <th>Type</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(rules)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([keyword, category]) => (
                <tr key={keyword}>
                  <td>{keyword}</td>
                  <td>{category}</td>
                  <td>
                    {isBaseRule(keyword) ? (
                      <span>Built-in</span>
                    ) : (
                      <span>Custom</span>
                    )}
                  </td>
                  <td>
                    {isCustomRule(keyword) && (
                      <button onClick={() => onRemoveRule(keyword)}>
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex' }}>
          <input
            type="text"
            placeholder="Keyword (e.g., 'netflix')"
            value={newKeyword}
            onChange={e => setNewKeyword(e.target.value)}
            onKeyPress={e => {
              if (e.key === 'Enter') {
                handleAddRuleClick()
              }
            }}
          />
          <input
            type="text"
            placeholder="Category (e.g., 'entertainment')"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            onKeyPress={e => {
              if (e.key === 'Enter') {
                handleAddRuleClick()
              }
            }}
          />
          <button
            onClick={handleAddRuleClick}
            disabled={!newKeyword.trim() || !newCategory.trim()}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

export { Categories }

