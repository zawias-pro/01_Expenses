import React from 'react'
import styles from './Button.module.css'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline'
}

const Button = ({ 
  variant = 'primary', 
  className = '', 
  children, 
  ...props 
}: ButtonProps) => {
  const variantClass = styles[variant]
  const classes = [styles['btn'], variantClass, className].filter(Boolean).join(' ')
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
