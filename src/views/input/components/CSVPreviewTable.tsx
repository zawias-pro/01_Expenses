import styles from './CSVPreviewTable.module.css'

const CSVPreviewTable = ({
  transactions,
}: {
  transactions: {id: string, date: string, description: string, amount: string, validationError: string|undefined }[]
}) => {
  if (transactions.length === 0) {
    return 'No data'
  }

  return (
    <div className={styles["wrapper"]}>
    <table>
      <thead>
      <tr>
        <th>Date</th>
        <th>Description</th>
        <th>Amount</th>
        <th>Errors</th>
      </tr>
      </thead>
      <tbody>
      {transactions.map((t) => (
        <tr key={t.id}>
          <td>{t.date}</td>
          <td>{t.description}</td>
          <td>{t.amount}</td>
          <td>{t.validationError ?? '-'}</td>
        </tr>
      ))}
      </tbody>
    </table>
    </div>
  )
}

export { CSVPreviewTable }
