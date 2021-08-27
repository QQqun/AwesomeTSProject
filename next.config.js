const withPlugins = require('next-compose-plugins')
const webpack = require('webpack')
// const withImages = require('next-images')
const withLess = require('@zeit/next-less')
const withCss = require('@zeit/next-css')
const path = require('path')
const fs = require('fs')
const lessToJS = require('less-vars-to-js')
const isProd = process.env.APP_ENV === 'production'
const FilterWarningsPlugin = require('webpack-filter-warnings-plugin')


// const {PHASE_DEVELOPMENT_SERVER} = require('next/constants')

// const themeVariables = lessToJS(
//   fs.readFileSync(path.resolve(__dirname, './src/styles/global.less'), 'utf8')
// )

module.exports = withPlugins([
  [withLess, {
    lessLoaderOptions: {
      javascriptEnabled: true,
      // modifyVars: themeVariables // make your antd custom effective
    }
  }],
  [withCss, {
    cssModules: false,
    cssLoaderOptions: {
      localIdentName: "[local]___[hash:base64:5]",
    },
  }]],
  {
    webpack5: false,
    distDir: 'dist',
    trailingSlash: true,
    webpack: (config, { isServer }) => {
      const originalEntry = config.entry
      config.entry = async () => {
        const entries = await originalEntry()
        return entries
      }

      if (isServer) {
        const antStyles = /antd-mobile\/.*?\/style.*?/
        const origExternals = [...config.externals]
        config.externals = [
          (context, request, callback) => {
            if (request.match(antStyles)) return callback()
            if (typeof origExternals[0] === 'function') {
              origExternals[0](context, request, callback)
            } else {
              callback()
            }
          },
          ...(typeof origExternals[0] === 'function' ? [] : origExternals),
        ]

        config.module.rules.unshift({
          test: antStyles,
          use: 'null-loader',
        })
      }

      config.plugins.push(
        new FilterWarningsPlugin({
          exclude: /mini-css-extract-plugin[^]*Conflicting order between:/,
        }),
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        })
      )

      return config
    },
  })