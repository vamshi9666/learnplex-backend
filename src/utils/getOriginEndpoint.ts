export function getOriginEndPoint() {
  return process.env.ORIGIN_ENDPOINT ?? 'http://localhost:3000'
}
