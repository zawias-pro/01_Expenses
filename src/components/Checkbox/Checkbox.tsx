import React from 'react'
import styles from './Checkbox.module.css'

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const Checkbox = ({
  label,
  ...props
}: CheckboxProps) => {
  return (
    <label className={styles['checkbox']}>
      <input type="checkbox"{...props} />
      {label}
    </label>
  )
}

export { Checkbox }
