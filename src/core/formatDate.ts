const locale = navigator.language

const formatDate = (dateOnly: string) => {
  const [year, month, day] = dateOnly.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString(locale)
}

export { formatDate }