import { rest } from 'msw';

export const handlers = [
    rest.post('/getUser', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({}));
    })
];
