import { sign } from 'jsonwebtoken'
import ms from 'ms'
import { Response } from 'express'

import { User } from '../entity/User.entity'

export type JWTAuthPayload = {
  userId: string
  tokenVersion?: number
}

export const createAccessToken = (userId: number, expiresIn = '15m') => {
  return sign({ userId }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: expiresIn
  })
}

export const createRefreshToken = (user: User) => {
  return sign(
    { userId: user.id, tokenVersion: user.tokenVersion },
    process.env.REFRESH_TOKEN_SECRET!,
    { expiresIn: '7d' }
  )
}

export const sendRefreshToken = (res: Response, refreshToken: string) => {
  res.cookie(process.env.REFRESH_COOKIE_NAME!, refreshToken, {
    maxAge: ms('7d'),
    httpOnly: true
  })
}
