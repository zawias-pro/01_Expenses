import styles from './Panel.module.css'

const Panel = ({
  children
}: {
  children: React.ReactNode
}) => {
  return (
    <div className={styles['panel']}>
      {children}
    </div>
  )
}

export { Panel }
