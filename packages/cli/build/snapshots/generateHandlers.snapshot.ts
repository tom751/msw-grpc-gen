import { rest } from 'msw';
import { CreateUserResponse, User } from '../../../pb/example';
import { Address } from '../../../pb/example_dep';
import { getResultAsString } from './helpers';

export const handlers = [
    rest.post('/getUser', (_req, res, ctx) => {
        return res(ctx.status(200), ctx.body(getResultAsString(User.toBinary({
            name: '',
            email: '',
            age: 0,
            active: false,
            amount: 0n,
            address: {
                firstLine: '',
                secondLine: '',
                town: '',
                country: '',
                postCode: ''
            }
        }))), ctx.set('Content-Type', 'application/grpc-web-text'));
    }),
    rest.post('/createuser', (_req, res, ctx) => {
        return res(ctx.status(200), ctx.body(getResultAsString(CreateUserResponse.toBinary({
            message: '',
            image: new Uint8Array(),
            status: 0,
            users: {}
        }))), ctx.set('Content-Type', 'application/grpc-web-text'));
    }),
    rest.post('/getUserAddress', (_req, res, ctx) => {
        return res(ctx.status(200), ctx.body(getResultAsString(Address.toBinary({
            firstLine: '',
            secondLine: '',
            town: '',
            country: '',
            postCode: ''
        }))), ctx.set('Content-Type', 'application/grpc-web-text'));
    })
];
