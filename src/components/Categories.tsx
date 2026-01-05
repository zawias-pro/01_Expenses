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
    <div className="section">
      <h2 className="section-header">Custom Categories</h2>
      
      <div>
        <h3 className="section-subheader">Expense Categories</h3>
        <div className="table-container">
          <table className="table">
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
                  <td><strong>{keyword}</strong></td>
                  <td>{category}</td>
                  <td>
                    {isBaseRule(keyword) ? (
                      <span className="status-badge" style={{ backgroundColor: 'var(--surface-hover)', color: 'var(--text-secondary)' }}>
                        Built-in
                      </span>
                    ) : (
                      <span className="status-badge status-warning">Custom</span>
                    )}
                  </td>
                  <td>
                    {isCustomRule(keyword) && (
                      <button 
                        className="btn btn-danger"
                        style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
                        onClick={() => { onRemoveRule(keyword) }}
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div style={{ marginTop: '1.5rem', padding: '1.5rem', backgroundColor: 'var(--surface-hover)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <h4 className="section-subheader" style={{ marginTop: 0 }}>Add New Rule</h4>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: '1', minWidth: '200px', marginBottom: 0 }}>
              <label className="form-label">Keyword</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., 'netflix'"
                value={newKeyword}
                onChange={e => { setNewKeyword(e.target.value) }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleAddRuleClick()
                  }
                }}
              />
            </div>
            <div className="form-group" style={{ flex: '1', minWidth: '200px', marginBottom: 0 }}>
              <label className="form-label">Category</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., 'entertainment'"
                value={newCategory}
                onChange={e => { setNewCategory(e.target.value) }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleAddRuleClick()
                  }
                }}
              />
            </div>
            <div>
              <button
                className="btn btn-primary"
                onClick={handleAddRuleClick}
                disabled={!newKeyword.trim() || !newCategory.trim()}
              >
                Add Rule
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { Categories }
