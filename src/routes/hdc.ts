import { AxiosResponse } from "axios";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export default async (fastify: FastifyInstance) => {
  fastify.get('/hdc/service-plan/ncd/screening', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const rs: AxiosResponse = await fastify.axios.hdc.get('/service-plan/ncd/screening')

      console.log(rs.data)

      reply
        .status(200)
        .send(rs.data)
    } catch (error) {
      request.log.error(error)
      reply
        .status(500)
        .send({ ok: false, error })
    }
  })
} 
