import React from "react"
import styles from "./Textarea.module.css"

const Textarea = ({
  label,
  id,
  ...props
}: {
  id: string
  label: string
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  return (
    <div className={styles['textarea']}>
      <label htmlFor={id} className={styles['label']}>
        {label}
      </label>
      <textarea
        id={id}
        className={styles['control']}
        {...props}
      />
    </div>
  )
}

export { Textarea }
