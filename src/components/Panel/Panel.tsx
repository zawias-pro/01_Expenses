import styles from './Panel.module.css'

const Panel = ({
  title,
  children,
}: {
  title?: string
  children: React.ReactNode
}) => {
  return (
    <div className={styles['panel']}>
      {title && (
        <h3 className={styles['title']}>
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}

export { Panel }
