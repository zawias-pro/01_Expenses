import React, { useEffect, useRef } from 'react'
import styles from './Modal.module.css'

const Modal = ({
  title,
  children,
  onClose,
  footer,
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
  footer?: React.ReactNode
}) => {
  const overlayRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => { document.removeEventListener('keydown', handleKeyDown) }
  }, [onClose])

  return (
    <div
      ref={overlayRef}
      className={styles['modalOverlay']}
    >
      <div className={styles['modal']}>
        <div className={styles['modalHeader']}>
          <h3 className={styles['modalTitle']}>
            {title}
          </h3>
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
