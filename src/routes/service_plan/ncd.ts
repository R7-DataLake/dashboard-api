import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getReasonPhrase, StatusCodes } from "http-status-codes";
import { Knex } from "knex";
import { SPNCDModel } from "../../models/service_plan/ncd";

export default async (fastify: FastifyInstance) => {

  const ncdModel = new SPNCDModel();
  const db: Knex = fastify.db;

  fastify.get('/screening', {
    onRequest: [fastify.authenticate]
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const response: any = await ncdModel.screening(db)
      const data: any = response[0].map((v: any) => {
        v.target = Number(v.target)
        v.result = Number(v.result)
        v.result1 = Number(v.result1)
        v.result2 = Number(v.result2)
        v.result3 = Number(v.result3)
        v.result4 = Number(v.result4)

        return v
      })
      reply
        .status(200)
        .send(data)
    } catch (error) {
      request.log.error(error)
      reply
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send(getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR))
    }

  })

} 
