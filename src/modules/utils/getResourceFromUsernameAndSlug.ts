import { User } from '../../entity/User.entity'
import { Resource } from '../../entity/Resource.entity'

export async function getResource(username: string, slug: string) {
  const [user] = await User.find({ where: { username }, take: 1 })
  console.log(user)
  if (!user) {
    return null
  }
  const userResources = await user.resources
  console.log(userResources)
  const [resource] = userResources.filter(
    (resource: Resource) => resource.slug == slug
  )
  return resource
}
