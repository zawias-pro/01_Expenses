import React from 'react'
import styles from './Header.module.css'

const SectionHeader = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <h2 className={styles['sectionHeader']}>
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
