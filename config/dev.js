module.exports = {
  env: {
    NODE_ENV: '"development"'
  },
  defineConstants: {
    API_URL: `"${process.env.API_URL || 'https://heidianapi.com/api/'}"`
  },
  mini: {},
  h5: {}
}
