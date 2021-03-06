import renderLayoutForFass from 'yk-cli/es/renderLayoutForFass'
import ReactDOMServer from 'react-dom/server'

const renderToStreamForFaas = async (ctx, config) => {
  const isLocal = config.env === 'local'
  const serverJs = config.serverJs

  if (config.type !== 'ssr') {
    const str = await renderLayoutForFass(ctx)
    return str
  }

  if (isLocal) {
    // 本地开发环境下每次刷新的时候清空require服务端文件的缓存，保证服务端与客户端渲染结果一致
    delete require.cache[serverJs]
  }

  if (!global.serverStream || isLocal) {
    global.serverStream = typeof serverJs === 'string' ? require('@/' + serverJs).default : serverJs
  }

  const serverRes = await global.serverStream(ctx)
  const stream = ReactDOMServer.renderToNodeStream(serverRes)
  return stream
}

export default renderToStreamForFaas
