import { MiddlewareFn } from 'type-graphql'
import { verify } from 'jsonwebtoken'

import { MyContext } from '../../types/MyContext'
import { JWTAuthPayload } from '../../utils/auth'

export const getAuthorizationPayloadFromToken = (context: MyContext) => {
  let payload

  try {
    const token = context.req.cookies[`${process.env.ACCESS_COOKIE_NAME}`]
    payload = verify(token, process.env.ACCESS_TOKEN_SECRET!) as JWTAuthPayload
  } catch (e) {
    console.error(e)
    throw new Error('not authenticated')
  }

  return payload
}

export const isAuthorized: MiddlewareFn<MyContext> = async (
  { context },
  next
) => {
  context.payload = await getAuthorizationPayloadFromToken(context)
  return next()
}
