import { GrpcWebFetchTransport } from '@protobuf-ts/grpcweb-transport'

import { UserServiceClient } from '../pb/example.client'
import './style.css'

const pre = document.querySelector<HTMLPreElement>('#user')
const fetchButton = document.querySelector<HTMLButtonElement>('#fetch-btn')

const transport = new GrpcWebFetchTransport({
  baseUrl: 'http://localhost:4000',
})

const client = new UserServiceClient(transport)

if (fetchButton) {
  fetchButton.addEventListener('click', () => {
    client.getUser({ name: 'bob' }).then(({ response }) => {
      // rome-ignore lint/style/noNonNullAssertion: trust me
      pre!.innerText = JSON.stringify(response, null, 2)
    })
  })
}
