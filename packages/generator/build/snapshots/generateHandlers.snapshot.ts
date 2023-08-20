import { rest } from 'msw';
import { CreateUserResponse, User } from '../../../pb/example';
import { Address } from '../../../pb/example_dep';
import { grpcResponse } from './helpers';

export const exampleHandlers = [
    rest.post('/getUser', (_req, res, _ctx) => {
        return res(grpcResponse(User.toBinary({
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
        })));
    }),
    rest.post('/createuser', (_req, res, _ctx) => {
        return res(grpcResponse(CreateUserResponse.toBinary({
            message: '',
            image: new Uint8Array(),
            status: 0,
            users: {}
        })));
    }),
    rest.post('/getUserAddress', (_req, res, _ctx) => {
        return res(grpcResponse(Address.toBinary({
            firstLine: '',
            secondLine: '',
            town: '',
            country: '',
            postCode: ''
        })));
    })
];
