import React from 'react'
import styles from './Header.module.css'

interface HeaderProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

const SectionHeader = ({ children, className = '', style }: HeaderProps) => {
  return (
    <h2 className={[styles['sectionHeader'], className].filter(Boolean).join(' ')} style={style}>
      {children}
    </h2>
  )
}

const SectionSubheader = ({ children, className = '', style }: HeaderProps) => {
  return (
    <h3 className={[styles['sectionSubheader'], className].filter(Boolean).join(' ')} style={style}>
      {children}
    </h3>
  )
}

export { SectionHeader, SectionSubheader }
