import { AxiosResponse } from "axios";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { request } from "http";
import {
  StatusCodes,
  getReasonPhrase
} from 'http-status-codes';

export default async (fastify: FastifyInstance) => {

  fastify.get('/health-check', {
    config: {
      rateLimit: {
        max: 3,
        timeWindow: '1 minute'
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      reply
        .status(StatusCodes.OK)
        .send(getReasonPhrase(StatusCodes.OK))
    } catch (error) {
      request.log.error(error)
      reply
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send(getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR))
    }
  })

  fastify.get('/cockpit/health-check', {
    onRequest: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await fastify.axios.cockpit.get('/health-check')
      reply
        .status(StatusCodes.OK)
        .send(getReasonPhrase(StatusCodes.OK))
    } catch (error) {
      reply
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send(getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR))
    }
  })

  fastify.get('/nhso7/health-check', {
    onRequest: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await fastify.axios.nhso7.get('/health-check')
      reply
        .status(StatusCodes.OK)
        .send(getReasonPhrase(StatusCodes.OK))
    } catch (error) {
      request.log.error(error)
      reply
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send(getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR))
    }
  })


} 
