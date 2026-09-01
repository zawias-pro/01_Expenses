const locale = navigator.language

const formatDateTime = (ms: number) => new Date(ms).toLocaleString(locale)

export { formatDateTime }