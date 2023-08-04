import { rest } from 'msw';
import type { CreateUserResponse, User } from '../../pb/example';

export const handlers = [
    rest.post('/getUser', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json<User>({}));
    }),
    rest.post('/createuser', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json<CreateUserResponse>({}));
    })
];
