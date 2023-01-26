import fastify from 'fastify'
import path, { join } from 'path'

const autoload = require('@fastify/autoload')
const helmet = require('@fastify/helmet')

require('dotenv').config({ path: join(__dirname, '../config.conf') })

const app = fastify({
  logger: {
    transport:
      process.env.NODE_ENV === 'development'
        ? {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
            colorize: true
          }
        }
        : undefined
  }
})

// Plugins
app.register(require('@fastify/formbody'))
app.register(require('@fastify/cors'))

// Rate limit
app.register(import('@fastify/rate-limit'), {
  global: false,
  max: 100,
  timeWindow: '1 minute'
})

app.register(
  helmet,
  { contentSecurityPolicy: false }
)

app.addHook('onSend', (request: any, reply: any, playload: any, next: any) => {
  reply.headers({
    'X-Powered-By': 'R7 Health Platform - DASHBOARD',
    'X-Processed-By': process.env.R7_DASHBOARD_SERVICE_HOSTNAME || 'dummy-server',
  })
  next()
})

// Database
app.register(require('./plugins/db'), {
  options: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'postgres',
      port: Number(process.env.DB_PORT) || 5432,
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'test',
    },
    searchPath: ['public'],
    pool: {
      min: 0,
      max: 100
    },
    debug: process.env.DB_DEBUG === "Y" ? true : false,
    // userParams: {
    //   userParam1: '451'
    // }
  }
})

// JWT
app.register(require('./plugins/jwt'), {
  secret: process.env.SECRET_KEY || '@1234567890@',
  sign: {
    iss: 'r7.moph.go.th',
    expiresIn: '1d'
  },
  messages: {
    badRequestErrorMessage: 'Format is Authorization: Bearer [token]',
    noAuthorizationInHeaderMessage: 'Autorization header is missing!',
    authorizationTokenExpiredMessage: 'Authorization token expired',
    authorizationTokenInvalid: (err: any) => {
      return `Authorization token is invalid: ${err.message}`
    }
  }
})

// Axios
app.register(require('fastify-axios'), {
  clients: {
    nhso7: {
      baseURL: 'https://khonkaen2.nhso.go.th/api.php',
      headers: {
        'Authorization': 'Bearer ' + process.env.R7_DASHBOARD_NHSO7_TOKEN
      }
    },
    cockpit: {
      baseURL: 'https://r7.moph.go.th/cpreg7/api',
      headers: {
        'Authorization': 'Bearer ' + process.env.R7_DASHBOARD_COCKPIT_TOKEN
      }
    },
    hdc: {
      baseURL: 'http://127.0.0.1:3000',
      headers: {
        'Authorization': 'Bearer ' + process.env.R7_DASHBOARD_HDC_TOKEN
      }
    },

  }
})

// routes
app.register(autoload, {
  dir: path.join(__dirname, 'routes')
})
// app.register(require("./routes/health_check"), { prefix: '/health-check' })
// app.register(require("./routes/welcome"), { prefix: '/' })
// app.register(require("./routes/services"), { prefix: '/services' })
// app.register(require("./routes/resources"), { prefix: '/resources' })
// app.register(require("./routes/schema"), { prefix: '/schema' })

export default app;
