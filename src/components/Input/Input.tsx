import React from 'react'
import styles from './Input.module.css'

const Input = ({
  label,
  id,
  ...props
}: {
  id: string
  label: string
} & React.InputHTMLAttributes<HTMLInputElement>) => {
    return (
      <div className={styles['input']}>
        <label htmlFor={id} className={styles['label']}>
          {label}
        </label>
        <input
          id={id}
          className={styles['control']}
          {...props}
        />
      </div>
    )
}

export { Input }
