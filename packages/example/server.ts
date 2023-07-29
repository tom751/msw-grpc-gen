import * as grpc from '@grpc/grpc-js'
import { IUserService, userServiceDefinition } from './pb/example.grpc-server'

const server = new grpc.Server()
const service: IUserService = {
  getUser: (_, callback) => {
    callback(null, {
      age: 20,
      email: 'a@a.com',
      name: 'Bob',
    })
  },
}
server.addService(userServiceDefinition, service)

server.bindAsync('0.0.0.0:1234', grpc.ServerCredentials.createInsecure(), () => {
  server.start()
  console.log('GRPC server running on port 1234')
})
