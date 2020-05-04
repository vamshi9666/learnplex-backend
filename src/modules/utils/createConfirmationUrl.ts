import { v4 } from 'uuid'

import { redis } from '../../redis'
import { confirmUserPrefix } from '../constants/redisPrefixes'
import { getOriginEndPoint } from '../../utils/getOriginEndpoint'

export const createConfirmationUrl: (_: number) => Promise<string> = async (
  userId: number
) => {
  const token = v4()
  await redis.set(confirmUserPrefix + token, userId, 'ex', 60 * 60 * 24) // 1 day expiration

  return `${getOriginEndPoint()}/user/confirm/${token}`
}
