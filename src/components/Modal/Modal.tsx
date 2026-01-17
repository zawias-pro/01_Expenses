import React from 'react'
import styles from './Modal.module.css'

interface ModalProps {
  title: string
  children: React.ReactNode
  onClose: () => void
  footer?: React.ReactNode
  maxWidth?: string
}

const Modal = ({ title, children, onClose, footer, maxWidth }: ModalProps) => {
  return (
    <div className={styles['modalOverlay']} onClick={onClose}>
      <div 
        className={styles['modal']} 
        onClick={(e) => { e.stopPropagation() }}
        style={maxWidth ? { maxWidth } : undefined}
      >
        <div className={styles['modalHeader']}>
          <h3 className={styles['modalTitle']}>{title}</h3>
          <button className={styles['modalClose']} onClick={onClose}>
            &times;
          </button>
        </div>
        <div className={styles['modalBody']}>
          {children}
        </div>
        {footer && (
          <div className={styles['modalFooter']}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export { Modal }
