import { AxiosResponse } from "axios";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export default async (fastify: FastifyInstance) => {

  fastify.get('/health-check', {
    onRequest: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const rs: AxiosResponse = await fastify.axios.cockpit.get('/health-check')
      reply
        .status(200)
        .send({ ok: true, results: rs.data })
    } catch (error) {
      reply
        .status(500)
        .send({ ok: false, error })
    }
  })

} 
