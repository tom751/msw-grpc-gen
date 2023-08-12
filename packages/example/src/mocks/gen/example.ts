import { rest } from 'msw';
import type { CreateUserResponse, User } from '../../../pb/example';
import type { Address } from '../../../pb/example_dep';

export const handlers = [
    rest.post('/getUser', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json<User>({
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
        }));
    }),
    rest.post('/createuser', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json<CreateUserResponse>({
            message: '',
            image: new Uint8Array(),
            status: 0,
            users: {}
        }));
    }),
    rest.post('/getUserAddress', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json<Address>({
            firstLine: '',
            secondLine: '',
            town: '',
            country: '',
            postCode: ''
        }));
    })
];
