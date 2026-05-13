import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodEffects } from 'zod';

type Schema = AnyZodObject | ZodEffects<AnyZodObject>;

export function validate(schemas: { body?: Schema; query?: Schema; params?: Schema }) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body)   req.body   = await schemas.body.parseAsync(req.body);
      if (schemas.query)  req.query  = await schemas.query.parseAsync(req.query) as Request['query'];
      if (schemas.params) req.params = await schemas.params.parseAsync(req.params) as Request['params'];
      next();
    } catch (err) {
      next(err);
    }
  };
}
