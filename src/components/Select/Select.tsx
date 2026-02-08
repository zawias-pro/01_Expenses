import { type ReactNode } from 'react'
import styles from './Select.module.css'

const Select = ({
  id,
  label,
  children,
  ...props
}: {
  id: string
  label: string
  children: ReactNode
} & React.SelectHTMLAttributes<HTMLSelectElement>) => (
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
      {...props}
    >
      {children}
    </select>
  </div>
)

export { Select }
