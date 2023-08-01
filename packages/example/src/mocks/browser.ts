import { GrpcStatusCode, GrpcWebFrame } from '@protobuf-ts/grpcweb-transport'
import { base64encode } from '@protobuf-ts/runtime'
import { rest, setupWorker } from 'msw'
import { User } from '../../pb/example'

function getResultAsString(data: Uint8Array, status: GrpcStatusCode = GrpcStatusCode.OK): string {
  // https://github.com/grpc/grpc/blob/master/doc/PROTOCOL-WEB.md
  // length-prefixed message framing https://www.oreilly.com/library/view/grpc-up-and/9781492058328/ch04.html
  const trailer = Buffer.from(`grpc-status:${status}`)
  const result = Buffer.concat([
    new Uint8Array([GrpcWebFrame.DATA]), // data is first frame
    new Uint8Array([0, 0, 0, data.length]), // length prefix
    data,
    new Uint8Array([GrpcWebFrame.TRAILER]), // trailers always comes last
    new Uint8Array([0, 0, 0, trailer.length]),
    trailer,
  ])

  return base64encode(result)
}

const handlers = [
  rest.post('http://localhost:4000/UserService/GetUser', (req, res, ctx) => {
    const user = getResultAsString(
      User.toBinary({
        age: 233,
        email: 'a@a.com',
        name: 'Bobby',
      }),
    )

    return res(ctx.status(200), ctx.body(user), ctx.set('Content-Type', 'application/grpc-web-text'))
  }),
]

export const worker = setupWorker(...handlers)
