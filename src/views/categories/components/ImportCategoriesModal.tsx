import { useState } from 'react'
import { Modal } from '../../../components/Modal/Modal.tsx'
import { Button } from '../../../components/Button/Button.tsx'
import { Textarea } from "../../../components/Textarea/Textarea.tsx"

interface ImportCategoriesModalProps {
  onImport: (categories: Record<string, string[]>) => void
  onClose: () => void
}

const ImportCategoriesModal = ({ onImport, onClose }: ImportCategoriesModalProps) => {
  const [csvContent, setCsvContent] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleClose = () => {
    onClose()
    setCsvContent('')
    setError(null)
  }

  const parseCategoriesCSV = (csv: string): Record<string, string[]> | null => {
    const lines = csv.split('\n').filter(line => line.trim())
    const categories: Record<string, string[]> = {}
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      
      const parts = line.split(';')
      if (parts.length !== 2) {
        setError(`Line ${i + 1}: Invalid format. Expected "categoryname;keyword1,keyword2,..."`)
        return null
      }
      
      const categoryName = parts[0]?.trim()
      if (!categoryName) {
        setError(`Line ${i + 1}: Category name is empty`)
        return null
      }
      
      const keywordsStr = parts[1]?.trim() ?? ''
      const keywords = keywordsStr ? keywordsStr.split(',').map(k => k.trim()).filter(k => k) : []
      
      // If category already exists in this import, merge keywords
      if (categories[categoryName]) {
        categories[categoryName] = [...new Set([...categories[categoryName], ...keywords])]
      } else {
        categories[categoryName] = keywords
      }
    }
    
    return categories
  }

  const handleImport = () => {
    if (!csvContent.trim()) {
      setError('Please paste CSV content')
      return
    }
    
    const categories = parseCategoriesCSV(csvContent)
    if (categories === null) {
      return // Error already set
    }
    
    if (Object.keys(categories).length === 0) {
      setError('No valid categories found')
      return
    }
    
    onImport(categories)
    handleClose()
  }

  return (
    <Modal
      title="Import Categories"
      onClose={handleClose}
      footer={
        <>
          <Button onClick={handleImport}>
            Import
          </Button>
          <Button onClick={handleClose}>
            Cancel
          </Button>
        </>
      }
    >
      <p style={{ marginTop: 0, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
        Paste CSV content in the format: <code>categoryname;keyword1,keyword2,keyword3</code>
      </p>
      <p style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        Note: This will replace all categories (except &quot;others&quot;). Transactions will be automatically reclassified.
      </p>
      <Textarea
        label={'Categories'}
        value={csvContent}
        onChange={e => {
          setCsvContent(e.target.value)
          setError(null)
        }}
        placeholder="zakupy;biedronka,lidl,tesco&#10;transport;uber,bolt&#10;rozrywka;netflix,spotify"
        style={{ minHeight: '300px', fontFamily: 'Courier New, monospace' }}
      />
      {error && (
        <p style={{ marginTop: '0.5rem', marginBottom: 0, color: 'var(--danger)', fontSize: '0.875rem' }}>
          {error}
        </p>
      )}
    </Modal>
  )
}

export { ImportCategoriesModal }
