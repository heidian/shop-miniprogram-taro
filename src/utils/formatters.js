import moment from 'moment'

export const formatCurrency = (value, { keepZero } = {}) => {
  /* parseFloat 和 + 不同, parseFloat 不会把 null, '' 和 [] 变成 0, 但是 + 会 */
  const decimalValue = parseFloat(value)
  if (!decimalValue && decimalValue !== 0) {
    return '-'
  }
  let formatted = Math.abs(decimalValue).toFixed(2)
  if (!keepZero) {
    formatted = +formatted
  }
  return `${decimalValue < 0 ? '-' : ''}¥${formatted}`
}

export const formatDate = (value) => {
  if (!value) {
    return '-';
  }
  const v = moment(value)
  return v.isValid() ? v.format('YYYY/MM/DD') : '-'
}

export const formatDateTime = (value) => {
  if (!value) {
    return '-';
  }
  const v = moment(value)
  return v.isValid() ? v.format('YYYY/MM/DD HH:mm') : '-'
}
