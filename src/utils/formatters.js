import moment from 'moment'

export const formatCurrency = (value, { removeTrailingZero=false } = {}) => {
  const decimalValue = +value
  if (!decimalValue && decimalValue !== 0) {
    return '-'
  }
  let formatted = Math.abs(decimalValue).toFixed(2)
  if (removeTrailingZero) {
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
