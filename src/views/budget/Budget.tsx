import { useStore, useCategoryMetadata, getCategoryNameFromId } from '../../store/useStore.ts'
import { AddBudgetForm } from './components/AddBudgetForm.tsx'
import { BudgetRow } from './components/BudgetRow.tsx'
import { SectionHeader, SectionSubheader } from '../../components/Header/Header.tsx'

const Budget = () => {
  const categoryMetadata = useCategoryMetadata()
  const budgets = useStore((state) => state.budgets) // category ID -> amount

  // Convert budget entries from IDs to names for display
  const budgetEntries = Object.entries(budgets)
    .map(([categoryId, amount]) => ({
      id: categoryId,
      name: getCategoryNameFromId(categoryId, categoryMetadata),
      amount
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div style={{ padding: '1.5rem' }}>
      <SectionHeader>Monthly Budget</SectionHeader>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        Define monthly budgets for each category. Amounts should be in PLN format (e.g., "1 000,00 PLN" or "500,00").
      </p>

      {/* Add New Budget */}
      <AddBudgetForm />

      {/* Budget List */}
      <div>
        <SectionSubheader style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1rem' }}>Current Budgets</SectionSubheader>
        {budgetEntries.length === 0 ? (
          <p style={{ color: '#666' }}>No budgets defined yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {budgetEntries.map(({ id, name, amount }) => (
              <BudgetRow key={id} name={name} amount={amount} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export { Budget }
