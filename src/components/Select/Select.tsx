import React from 'react'
import styles from './Select.module.css'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  id?: string
}

const Select = ({ label, id, className = '', children, ...props }: SelectProps) => {
  const selectElement = (
    <select
      id={id}
      className={[styles['select'], className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </select>
  )

  if (label) {
    return (
      <div className={styles['formGroup']}>
        <label htmlFor={id} className={styles['label']}>
          {label}
        </label>
        {selectElement}
      </div>
    )
  }

  return selectElement
}

export { Select }
