import React from 'react'
import styles from './Button.module.css'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger'
}

const Button = ({ 
  variant = 'primary',
  children, 
  ...props 
}: ButtonProps) => {
  const variantClass = styles[variant]
  const classes = [styles['btn'], variantClass].filter(Boolean).join(' ')
  return (
    <button 
      className={classes} 
      {...props}
    >
      {children}
    </button>
  )
}

export { Button }
