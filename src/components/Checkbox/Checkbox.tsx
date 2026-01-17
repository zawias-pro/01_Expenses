import React from 'react'
import styles from './Checkbox.module.css'

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const Checkbox = ({ label, className = '', ...props }: CheckboxProps) => {
  const checkboxElement = (
    <input
      type="checkbox"
      className={[styles['checkbox'], className].filter(Boolean).join(' ')}
      {...props}
    />
  )

  if (label) {
    return (
      <label className={styles['label']}>
        {checkboxElement}
        {label}
      </label>
    )
  }

  return checkboxElement
}

export { Checkbox }
