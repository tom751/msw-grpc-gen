import { expect, it } from 'vitest'
import { generate } from './generate'

it('generates correctly', async () => {
  const result = generate('/home/tom/code/typescript/msw-grpc-gen/packages/example/pb/example.client.ts')
  await expect(result).toMatchFileSnapshot('./snapshots/generate.snapshot.ts')
})
