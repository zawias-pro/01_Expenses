import { Button } from '../../../components/Button/Button.tsx'
import { Input } from '../../../components/Input/Input.tsx'
import { FormGroup } from "../../../components/FormGroup/FormGroup.tsx"

interface AddCategoryFormProps {
  newCategory: string
  newKeywords: string
  onNewCategoryChange: (value: string) => void
  onNewKeywordsChange: (value: string) => void
  onUpdateCategory: (categoryName: string, keywords: string[]) => void
}

const AddCategoryForm = ({
  newCategory,
  newKeywords,
  onNewCategoryChange,
  onNewKeywordsChange,
  onUpdateCategory,
}: AddCategoryFormProps) => {
  const handleAddCategory = () => {
    if (newCategory.trim() && newKeywords.trim()) {
      const keywordsArray = newKeywords.split(',').map(k => k.trim()).filter(k => k)
      onUpdateCategory(newCategory.trim(), keywordsArray)
      onNewCategoryChange('')
      onNewKeywordsChange('')
    }
  }

  return (
    <div>
      <FormGroup>
        <Input
          id={'category'}
          label="Category"
          type="text"
          placeholder="entertainment"
          value={newCategory}
          onChange={e => { onNewCategoryChange(e.target.value) }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              handleAddCategory()
            }
          }}
        />
        <Input
          id={'keywords'}
          label="Keywords"
          type="text"
          placeholder="netflix,spotify,hbo"
          value={newKeywords}
          onChange={e => { onNewKeywordsChange(e.target.value) }}
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
        Add
      </Button>
    </div>
  )
}

export { AddCategoryForm }
