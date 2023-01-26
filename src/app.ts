import fastify from 'fastify'
import { join } from 'path';

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

// Database
app.register(require('./plugins/db'), {
  options: {
    client: 'mysql2',
    connection: {
      host: process.env.R7_DASHBOARD_DB_HOST || 'localhost',
      user: process.env.R7_DASHBOARD_DB_USER || 'root',
      port: Number(process.env.R7_DASHBOARD_DB_PORT) || 3306,
      password: process.env.R7_DASHBOARD_DB_PASSWORD || '',
      database: process.env.R7_DASHBOARD_DB_NAME || 'test',
    },
    pool: {
      min: 10,
      max: 500
    },
    debug: process.env.R7_DASHBOARD_DB_DEBUG === "Y" ? true : false,
  }
})

// JWT
app.register(require('./plugins/jwt'), {
  secret: process.env.R7_DASHBOARD_SECRET_KEY || '@1234567890@',
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

  }
})

// routes
app.register(require("./routes/service_plan/ncd"), { prefix: '/service-plan/ncd' })
app.register(require("./routes/cockpit"), { prefix: '/cockpit' })
app.register(require("./routes/nhso7"), { prefix: '/nhso7' })

export default app
