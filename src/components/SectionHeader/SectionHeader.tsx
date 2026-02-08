import React from 'react'
import styles from './SectionHeader.module.css'

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

export { SectionHeader }
