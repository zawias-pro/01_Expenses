import React, { useEffect, useRef } from 'react'
import styles from './Modal.module.css'

interface ModalProps {
  title: string
  children: React.ReactNode
  onClose: () => void
  footer?: React.ReactNode
  maxWidth?: string
}

const Modal = ({ title, children, onClose, footer, maxWidth }: ModalProps) => {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleOverlayPointerDown = (e: React.PointerEvent) => {
    if (e.target === overlayRef.current) {
      onClose()
    }
  }

  return (
    <div
      ref={overlayRef}
      className={styles['modalOverlay']}
      onPointerDown={handleOverlayPointerDown}
    >
      <div
        className={styles['modal']}
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
