import Fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify'
import { Server, IncomingMessage, ServerResponse } from 'http'
import { createReadExcel } from  './APIs/excel'


const server: FastifyInstance = Fastify({})



  createReadExcel(server)
  
  const start = async () => {
    try {
      await server.listen({ port: 5000, host:"0.0.0.0" })
        
      console.log("Server running port 5000")
      const address = server.server.address()
    const port = typeof address === 'string' ? address : address?.port
    
    } catch (err) {
      server.log.error(err)
      process.exit(1)
    }
  }
  start()