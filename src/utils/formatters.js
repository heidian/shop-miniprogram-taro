import moment from 'moment'

export const formatCurrency = (value) => {
  value = '' + value
  if (!+value && +value !== 0) {
    return '-'
  } else if (+value < 0) {
    return '-¥' + value.substr(1)
  } else {
    return '¥' + value
  }
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
