import { rest } from 'msw';
import type { CreateUserResponse, User } from '../../../pb/example';

export const handlers = [
    rest.post('/getUser', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json<User>({
            name: '',
            email: '',
            age: 0,
            active: false,
            amount: 0n
        }));
    }),
    rest.post('/createuser', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json<CreateUserResponse>({
            message: '',
            image: new Uint8Array(),
            status: 0,
            users: {}
        }));
    })
];
