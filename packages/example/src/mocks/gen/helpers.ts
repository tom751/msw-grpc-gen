import { GrpcStatusCode, GrpcWebFrame } from '@protobuf-ts/grpcweb-transport'
import { base64encode } from '@protobuf-ts/runtime'
import { compose, context } from 'msw'

export function grpcResponse(data: Uint8Array, status: GrpcStatusCode = GrpcStatusCode.OK) {
  // https://github.com/grpc/grpc/blob/master/doc/PROTOCOL-WEB.md
  // length-prefixed message framing https://www.oreilly.com/library/view/grpc-up-and/9781492058328/ch04.html
  const trailer = Buffer.from(`grpc-status:${status}`)
  const result = Buffer.concat([
    new Uint8Array([GrpcWebFrame.DATA]),
    new Uint8Array([0, 0, 0, data.length]),
    data,
    new Uint8Array([GrpcWebFrame.TRAILER]),
    new Uint8Array([0, 0, 0, trailer.length]),
    trailer,
  ])
  const body = base64encode(result)

  return compose(
    context.set('Content-Type', 'application/grpc-web-text'),
    context.status(200),
    context.body(body),
  )
}
