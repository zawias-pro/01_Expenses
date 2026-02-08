const FormGroup = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <div style={{display: "grid", gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '1rem', width: '100%'}}>
      {children}
    </div>
  )
}

export { FormGroup }
