import React from 'react'
import styles from './Input.module.css'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  id?: string
}

const Input = ({ label, id, className = '', ...props }: InputProps) => {
  const inputElement = (
    <input
      id={id}
      className={[styles['input'], className].filter(Boolean).join(' ')}
      {...props}
    />
  )

  if (label) {
    return (
      <div className={styles['formGroup']}>
        <label htmlFor={id} className={styles['label']}>
          {label}
        </label>
        {inputElement}
      </div>
    )
  }

  return inputElement
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  id?: string
}

const TextArea = ({ label, id, className = '', ...props }: TextAreaProps) => {
  const textAreaElement = (
    <textarea
      id={id}
      className={[styles['textarea'], className].filter(Boolean).join(' ')}
      {...props}
    />
  )

  if (label) {
    return (
      <div className={styles['formGroup']}>
        <label htmlFor={id} className={styles['label']}>
          {label}
        </label>
        {textAreaElement}
      </div>
    )
  }

  return textAreaElement
}

export { Input, TextArea }
