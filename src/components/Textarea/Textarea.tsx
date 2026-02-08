import React from "react"
import styles from "./Textarea.module.css"

const Textarea = ({
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

export { Textarea }
