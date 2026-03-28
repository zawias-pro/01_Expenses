import { Button } from '../../../components/Button/Button.tsx'
import { Input } from '../../../components/Input/Input.tsx'
import { FormGroup } from "../../../components/FormGroup/FormGroup.tsx"
import { useState } from "react"
import { useStore } from "../../../store/useStore.ts"

const AddCategoryForm = () => {
  const [newCategory, setNewCategory] = useState('')
  const [newKeywords, setNewKeywords] = useState('')
  const categories = useStore((state) => state.categoryMetadata)
  const onUpdateCategory = useStore((state) => state.updateCategory)

  const handleAddCategory = () => {
    if (!newKeywords.trim() || !newCategory.trim()) {
      return
    }
    if(Object.values(categories).includes(newCategory.toLowerCase())) {
      alert("Category already exists")
      return
    }
    const keywordsArray = newKeywords.split(',').map(k => k.trim()).filter(k => k)
    onUpdateCategory(newCategory.trim(), keywordsArray)
    setNewCategory('')
    setNewKeywords('')
  }

  return (
    <>
      <FormGroup>
        <Input
          id={'category'}
          label="Category"
          type="text"
          placeholder="category"
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
          label="Keywords"
          type="text"
          placeholder="keyword1, keyword2, keyword3"
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
        Add
      </Button>
    </>
  )
}

export { AddCategoryForm }
