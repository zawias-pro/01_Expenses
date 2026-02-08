import { useStore } from '../../../store/useStore.ts'
import { Button } from '../../../components/Button/Button.tsx'
import { Input } from '../../../components/Input/Input.tsx'
import { SectionHeader } from '../../../components/SectionHeader/SectionHeader.tsx'
import { FormGroup } from "../../../components/FormGroup/FormGroup.tsx"

interface AddCategoryFormProps {
  onUpdateCategory: (categoryName: string, keywords: string[]) => void
}

const AddCategoryForm = ({ onUpdateCategory }: AddCategoryFormProps) => {
  const newCategory = useStore((state) => state.newCategory)
  const newKeywords = useStore((state) => state.newKeywords)
  const setNewCategory = useStore((state) => state.setNewCategory)
  const setNewKeywords = useStore((state) => state.setNewKeywords)

  const handleAddCategory = () => {
    if (newCategory.trim() && newKeywords.trim()) {
      const keywordsArray = newKeywords.split(',').map(k => k.trim()).filter(k => k)
      onUpdateCategory(newCategory.trim(), keywordsArray)
      setNewCategory('')
      setNewKeywords('')
    }
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '.5rem', alignItems: 'flex-start'}}>
<FormGroup>
          <Input
            id={'category'}
            label="Category"
            type="text"
            placeholder="entertainment"
            value={newCategory}
            onChange={e => { setNewCategory(e.target.value) }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleAddCategory()
              }
            }}
          />
          <Input
            id={'keywords'}
            label="Keywords (comma-separated)"
            type="text"
            placeholder="netflix, spotify, hbo"
            value={newKeywords}
            onChange={e => { setNewKeywords(e.target.value) }}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleAddCategory()
              }
            }}
          />
</FormGroup>

  <Button
    onClick={handleAddCategory}
    disabled={!newCategory.trim() || !newKeywords.trim()}
  >
    Add Category
  </Button>
  </div>
  )
}

export { AddCategoryForm }
