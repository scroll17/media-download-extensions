import { RequestHandler } from 'express'

export const cors: RequestHandler = (req, res, next) => {
    res.setHeader('access-control-allow-origin', req.headers.origin || '*');
    res.setHeader('access-control-request-method', '*');
    res.setHeader('access-control-allow-methods', '*');
    res.setHeader('access-control-allow-headers', '*');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
    } else if (next) {
        next();
    }
};
