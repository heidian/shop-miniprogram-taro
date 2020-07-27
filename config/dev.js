module.exports = {
  env: {
    NODE_ENV: '"development"'
  },
  defineConstants: {
    API_URL: `"${process.env.API_URL || 'https://api.erpjing.com/api/'}"`
  },
  mini: {},
  h5: {}
}
