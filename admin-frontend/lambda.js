const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const app = next({ dev: false })
const handle = app.getRequestHandler()

let server

exports.handler = async (event, context) => {
  if (!server) {
    await app.prepare()
    server = createServer((req, res) => {
      const parsedUrl = parse(req.url, true)
      handle(req, res, parsedUrl)
    })
  }

  return new Promise((resolve, reject) => {
    const { httpMethod, path, queryStringParameters, headers, body } = event

    const req = {
      method: httpMethod,
      url: path + (queryStringParameters ? '?' + new URLSearchParams(queryStringParameters).toString() : ''),
      headers: headers || {},
      body: body || ''
    }

    const res = {
      statusCode: 200,
      headers: {},
      body: '',
      setHeader: function(name, value) {
        this.headers[name] = value
      },
      writeHead: function(statusCode, headers) {
        this.statusCode = statusCode
        if (headers) {
          Object.assign(this.headers, headers)
        }
      },
      write: function(chunk) {
        this.body += chunk
      },
      end: function(chunk) {
        if (chunk) this.body += chunk
        resolve({
          statusCode: this.statusCode,
          headers: this.headers,
          body: this.body
        })
      }
    }

    server.emit('request', req, res)
  })
}