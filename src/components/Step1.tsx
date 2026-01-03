interface Step1Props {
  csvContent: string
  onCsvChange: (content: string) => void
  onNext: () => void
}

export function Step1({ csvContent, onCsvChange, onNext }: Step1Props) {
  return (
    <div>
      <h2>Step 1: Paste CSV Content</h2>
      <textarea
        value={csvContent}
        onChange={e => onCsvChange(e.target.value)}
        rows={10}
        style={{ width: '100%', fontFamily: 'monospace' }}
      />
      <div style={{ marginTop: '1rem' }}>
        <button onClick={onNext}>Next</button>
      </div>
    </div>
  )
}

