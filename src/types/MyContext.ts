import { Request, Response } from 'express'

import { JWTAuthPayload } from '../utils/auth'

export interface MyContext {
  req: Request
  res: Response
  payload?: JWTAuthPayload
}
