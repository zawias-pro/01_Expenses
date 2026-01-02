import { useState } from 'react'
import './App.css'
import { parseCSVLine, processTransactions } from './webUtils'
import type { Transaction, MonthlySummary } from './webUtils'
import { formatPolishNumber } from './formatPolishNumber'

const INITIAL_CSV = `2025-12-12;"JAN ADAM KOWALSKI, CZYNSZ NAJMU                                                                         PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     74899274659992743764666621  ";"MojBank 1234 ... 5678";"Czynsz i wynajem";-5 000,00 PLN;;
2025-11-18;"ALA MAKOTA, PLATNOSC                                                                         PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     73829917394502917062843947  ";"MojBank 1234 ... 5678";"Bez kategorii";-450,00 PLN;;
2025-10-11;"Revolut**1234*  ZAKUP PRZY UŻYCIU KARTY - INTERNET                                                  transakcja nierozliczona";"MojBank 1234 ... 5678";"Opłaty i odsetki";-1500,00 PLN;;
2025-09-18;"ANNA NOWAK, PLATNOSC ZA SIERPIEN                                                                         PRZELEW ZEWNĘTRZNY WYCHODZĄCY                                                     37102029640000650201218148  ";"MojBank 1234 ... 5678";"Bez kategorii";-350,00 PLN;;
2025-09-14;"PRZELEW  TEST                    00-000 MIASTO                        PRZELEW WEWNĘTRZNY PRZYCHODZĄCY                                                   73628298163829405836289922  ";"MojBank 1234 ... 5678";"Przelew własny";2 241,61 PLN;;`;

const RULES: Record<string, string> = {
  'walmart': 'grocery',
  'vodafone': 'mobile',
  'transfer': 'transfers',
  'Czynsz': 'housing',
  'Revolut': 'finance'
};

const getInitialData = () => {
  const lines = INITIAL_CSV.split('\n').filter(l => l.trim());
  return lines.map(parseCSVLine).filter((t): t is Transaction => t !== null);
};

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(getInitialData);
  const [summaries, setSummaries] = useState<MonthlySummary[] | null>(null);

  const handleUpdate = (id: string, field: keyof Transaction, value: string | boolean) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleProcess = () => {
    const activeTransactions = transactions.filter(t => !t.excluded);
    const result = processTransactions(activeTransactions, RULES);
    setSummaries(result);
  };

  return (
    <div className="container">
      <h1>Expense Analyzer</h1>
      
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
                  onChange={e => handleUpdate(t.id, 'excluded', e.target.checked)} 
                />
              </td>
              <td><input type="text" value={t.date} onChange={e => handleUpdate(t.id, 'date', e.target.value)} /></td>
              <td><input type="text" value={t.description} onChange={e => handleUpdate(t.id, 'description', e.target.value)} /></td>
              <td><input type="text" value={t.account} onChange={e => handleUpdate(t.id, 'account', e.target.value)} /></td>
              <td><input type="text" value={t.category} onChange={e => handleUpdate(t.id, 'category', e.target.value)} /></td>
              <td><input type="text" value={t.amount} onChange={e => handleUpdate(t.id, 'amount', e.target.value)} /></td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="process-btn" onClick={handleProcess}>Process Transactions</button>

      {summaries && (
        <div className="modal-overlay" onClick={() => setSummaries(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Summary</h2>
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
            <button onClick={() => setSummaries(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
