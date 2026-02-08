import React from 'react'
import styles from './Input.module.css'

const Input = ({
  label,
  ...props
}: {
  label: string
} & React.InputHTMLAttributes<HTMLInputElement>) => {
    return (
      <div className={styles['formGroup']}>
        <label htmlFor={props.id} className={styles['label']}>
          {label}
        </label>
        <input
          id={props.id}
          className={styles['input']}
          {...props}
        />
      </div>
    )
}

const TextArea = ({
  label,
  ...props
}: {
  label: string
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  return (
    <div className={styles['formGroup']}>
      <label htmlFor={props.id} className={styles['label']}>
        {label}
      </label>
      <textarea
        id={props.id}
        className={styles['textarea']}
        {...props}
      />
    </div>
  )
}

export { Input, TextArea }
