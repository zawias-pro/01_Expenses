import { useStore, useCategoryMetadata, getCategoryNameFromId } from '../../store/useStore.ts'
import { AddBudgetForm } from './components/AddBudgetForm.tsx'
import { BudgetRow } from './components/BudgetRow.tsx'
import { SectionHeader } from '../../components/SectionHeader/SectionHeader.tsx'
import { Panel } from "../../components/Panel/Panel.tsx"

const Budget = () => {
  const categoryMetadata = useCategoryMetadata()
  const budgets = useStore((state) => state.budgets) // category ID -> amount

  const budgetEntries = Object.entries(budgets)
    .map(([categoryId, amount]) => ({
      id: categoryId,
      name: getCategoryNameFromId(categoryId, categoryMetadata),
      amount
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <>
      <SectionHeader>Monthly Budget</SectionHeader>
      <p>
        Define monthly budgets for each category. Amounts should be in PLN format (e.g., "1 000,00 PLN" or "500,00").
      </p>

      <Panel title={'Add new budget'}>
        <AddBudgetForm/>
      </Panel>

      <Panel title={'Current Budgets'}>
        {budgetEntries.length === 0
          ? (
            <p>No budgets defined yet.</p>
          )
          : (
            <div>
              {budgetEntries.map(({ id, name, amount }) => (
                <BudgetRow key={id} name={name} amount={amount}/>
              ))}
            </div>
          )}
      </Panel>
    </>
  )
}

export { Budget }
