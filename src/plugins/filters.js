import Vue from 'vue'
import { formatCurrency, formatDate, formatDateTime } from '../utils/formatters'
import { optimizeImage } from '../utils/image'

/*
 * 定义全局 filters
 */
Vue.filter('date', (value) => formatDate(value))
Vue.filter('datetime', (value, fmt) => formatDateTime(value, fmt))
Vue.filter('currency', (value, options) => formatCurrency(value, options))
Vue.filter('imageUrl', (value, width, height) => optimizeImage(value, width, height))
