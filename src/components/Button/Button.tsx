import React from 'react'
import styles from './Button.module.css'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
}

const Button = ({ 
  variant = 'primary',
  children, 
  ...props 
}: ButtonProps) => {
  const classes = [styles['btn'], styles[variant]].filter(Boolean).join(' ')

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
