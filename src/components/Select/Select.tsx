import { type ReactNode } from 'react'
import styles from './Select.module.css'

const Select = ({
  id,
  label,
  children
}: {
  id: string
  label: string
  children: ReactNode
}) => (
  <div className={styles['formGroup']}>
    <label
      htmlFor={id}
      className={styles['label']}
    >
      {label}
    </label>
    <select
      id={id}
      className={styles['select']}
    >
      {children}
    </select>
  </div>
)

export { Select }
