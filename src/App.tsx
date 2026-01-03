import { useState, useEffect } from 'react'
import './App.css'
import { parseCSVLine, processTransactions, parseRules } from './webUtils'
import type { Transaction, MonthlySummary } from './webUtils'
import { formatPolishNumber } from './formatPolishNumber'
import rulesContent from './rules.csv?raw'

const INITIAL_CSV = `2025-12-12;"JAN ADAM KOWALSKI, CZYNSZ NAJMU                                                                         PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     74899274659992743764666621  ";"MojBank 1234 ... 5678";"Czynsz i wynajem";-5 000,00 PLN;;
2025-11-18;"ALA MAKOTA, PLATNOSC                                                                         PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     73829917394502917062843947  ";"MojBank 1234 ... 5678";"Bez kategorii";-450,00 PLN;;
2025-10-11;"Revolut**1234*  ZAKUP PRZY UŻYCIU KARTY - INTERNET                                                  transakcja nierozliczona";"MojBank 1234 ... 5678";"Opłaty i odsetki";-1500,00 PLN;;
2025-09-18;"ANNA NOWAK, PLATNOSC ZA SIERPIEN                                                                         PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     37102029640000650201218148  ";"MojBank 1234 ... 5678";"Bez kategorii";-350,00 PLN;;
2025-09-14;"PRZELEW  TEST                    00-000 MIASTO                        PRZELEW WEWNĘTRZNY PRZYCHODZĄCY                                                   73628298163829405836289922  ";"MojBank 1234 ... 5678";"Przelew własny";2 241,61 PLN;;`

const RULES = parseRules(rulesContent)

const STORAGE_KEYS = {
  csv: 'expense-analyzer-csv',
  transactions: 'expense-analyzer-transactions',
  step: 'expense-analyzer-step',
}

type Step = 1 | 2 | 3

function App() {
  const [step, setStep] = useState<Step>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.step)
    return saved ? (Number(saved) as Step) : 1
  })
  const [csvContent, setCsvContent] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.csv)
    return saved || INITIAL_CSV
  })
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.transactions)
    return saved ? JSON.parse(saved) : []
  })
  const [summaries, setSummaries] = useState<MonthlySummary[] | null>(null)

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.csv, csvContent)
  }, [csvContent])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(transactions))
  }, [transactions])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.step, String(step))
  }, [step])

  // Recalculate summaries on initial load if we're on step 3
  useEffect(() => {
    if (step === 3 && transactions.length > 0 && summaries === null) {
      const activeTransactions = transactions.filter(t => !t.excluded)
      const result = processTransactions(activeTransactions, RULES)
      setSummaries(result)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEYS.csv)
    localStorage.removeItem(STORAGE_KEYS.transactions)
    localStorage.removeItem(STORAGE_KEYS.step)
    setCsvContent(INITIAL_CSV)
    setTransactions([])
    setSummaries(null)
    setStep(1)
  }

  const handleCsvSubmit = () => {
    const lines = csvContent.split('\n').filter(l => l.trim())
    const parsed = lines.map(parseCSVLine).filter((t): t is Transaction => t !== null)
    setTransactions(parsed)
    setStep(2)
  }

  const handleUpdateExcluded = (id: string, excluded: boolean) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, excluded } : t))
  }

  const handleProcess = () => {
    const activeTransactions = transactions.filter(t => !t.excluded)
    const result = processTransactions(activeTransactions, RULES)
    setSummaries(result)
    setStep(3)
  }

  const handleBack = () => {
    if (step === 2) {
      setStep(1)
    } else if (step === 3) {
      setStep(2)
    }
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>Expense Analyzer</h1>
        <button onClick={handleClear}>Clear & Start Over</button>
      </div>
      
      {step === 1 && (
        <div>
          <h2>Step 1: Paste CSV Content</h2>
          <textarea
            value={csvContent}
            onChange={e => setCsvContent(e.target.value)}
            rows={10}
            style={{ width: '100%', fontFamily: 'monospace' }}
          />
          <div style={{ marginTop: '1rem' }}>
            <button onClick={handleCsvSubmit}>Next</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2>Step 2: Exclude Transactions</h2>
          <table className="transaction-table">
            <thead>
              <tr>
                <th>Exclude</th>
                <th>Date</th>
                <th>Description</th>
                <th>Account</th>
                <th>Category</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id} className={t.excluded ? 'excluded-row' : ''}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={t.excluded} 
                      onChange={e => handleUpdateExcluded(t.id, e.target.checked)} 
                    />
                  </td>
                  <td>{t.date}</td>
                  <td>{t.description}</td>
                  <td>{t.account}</td>
                  <td>{t.category}</td>
                  <td>{t.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: '1rem' }}>
            <button onClick={handleBack} style={{ marginRight: '0.5rem' }}>Back</button>
            <button onClick={handleProcess}>Next</button>
          </div>
        </div>
      )}

      {step === 3 && summaries && (
        <div>
          <h2>Step 3: Summary</h2>
          {summaries.map(s => (
            <div key={s.month} className="month-summary">
              <h3>Month: {s.month}</h3>
              <p>Total Expenses: {formatPolishNumber(s.totalExpenses)}</p>
              <p>Total Income: {formatPolishNumber(s.totalIncome)}</p>
              <p>Balance: {formatPolishNumber(s.balance)}</p>
              <h4>Categories:</h4>
              <ul>
                {Object.entries(s.categories).map(([cat, amount]) => (
                  <li key={cat}>{cat}: {formatPolishNumber(amount)}</li>
                ))}
              </ul>
            </div>
          ))}
          <div style={{ marginTop: '1rem' }}>
            <button onClick={handleBack}>Back</button>
          </div>
        </div>
      )}
    </div>
  )
}

export { App }
