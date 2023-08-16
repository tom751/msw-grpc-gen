
import { GrpcStatusCode, GrpcWebFrame } from '@protobuf-ts/grpcweb-transport'
import { base64encode } from '@protobuf-ts/runtime'

export function getResultAsString(data: Uint8Array, status: GrpcStatusCode = GrpcStatusCode.OK): string {
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
  return base64encode(result)
}

