import { expect, it } from 'vitest'
import { generateHandlers } from './handlers'

it('generates handlers correctly', async () => {
  const result = generateHandlers(
    '/home/tom/code/typescript/msw-grpc-gen/packages/example/pb/example.client.ts',
    '/home/tom/code/typescript/msw-grpc-gen/packages/example/src/mocks',
  )
  await expect(result).toMatchFileSnapshot('./snapshots/handlers.snapshot.ts')
})
