interface Step1Props {
  csvContent: string
  onCsvChange: (content: string) => void
  onFillExample: () => void
  onNext: () => void
}

function Step1({ csvContent, onCsvChange, onFillExample, onNext }: Step1Props) {
  return (
    <div>
      <h2>Step 1: Paste CSV Content</h2>
      <textarea
        value={csvContent}
        onChange={e => onCsvChange(e.target.value)}
        rows={10}
        style={{ width: '100%', fontFamily: 'monospace' }}
        placeholder="Paste your CSV data here..."
      />
      <div style={{ marginTop: '1rem' }}>
        <button onClick={onFillExample} style={{ marginRight: '0.5rem' }}>
          Fill with Example Data
        </button>
        <button onClick={onNext}>Next</button>
      </div>
    </div>
  )
}

export { Step1 }


