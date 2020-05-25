import { Resource } from '../../entity/Resource.entity'
import { Section } from '../../entity/Section.entity'

async function getFirstLeaf(
  section: Section,
  paths: { firstLeafPath: string; lastLeafPath: string }
): Promise<string> {
  const subSections = await Section.find({
    where: { parentSectionId: section.id, deleted: false },
    order: {
      order: 'ASC',
    },
  })
  if (subSections.length === 0) {
    return section.id
  }
  const firstSubSection = subSections[0]
  paths.firstLeafPath = paths.firstLeafPath + '/' + firstSubSection.slug
  return getFirstLeaf(firstSubSection, paths)
}

async function getLastLeaf(
  section: Section,
  paths: { firstLeafPath: string; lastLeafPath: string }
): Promise<string> {
  const subSections = await Section.find({
    where: { parentSectionId: section.id, deleted: false },
    order: {
      order: 'DESC',
    },
  })
  if (subSections.length === 0) {
    return section.id
  }
  const firstSubSection = subSections[0]
  paths.lastLeafPath = paths.lastLeafPath + '/' + firstSubSection.slug
  return getLastLeaf(firstSubSection, paths)
}

async function setSlugsPath(currentSection: Section) {
  let sections = await currentSection.sections
  sections = sections.filter((section) => !section.deleted)
  sections = sections.sort((a, b) => {
    return a.order > b.order ? 1 : a.order < b.order ? -1 : 0
  })
  for (let index = 0; index < sections.length; index++) {
    let section = sections[index]
    section.slugsPath = currentSection.slugsPath + '/' + section.slug
    section.pathWithSectionIds =
      currentSection.pathWithSectionIds + '/' + section.id
    const paths = {
      firstLeafPath: section.slugsPath,
      lastLeafPath: section.slugsPath,
    }
    section.firstLeafSectionId = await getFirstLeaf(section, paths)
    section.firstLeafSlugsPath = paths.firstLeafPath
    section.lastLeafSectionId = await getLastLeaf(section, paths)
    section.lastLeafSlugsPath = paths.lastLeafPath
    if (index - 1 >= 0) section.previousSectionId = sections[index - 1].id
    else section.previousSectionId = currentSection.previousSectionId
    if (index + 1 < sections.length)
      section.nextSectionId = sections[index + 1].id
    else section.nextSectionId = currentSection.nextSectionId
    section.pathWithSectionIds =
      currentSection.pathWithSectionIds + '/' + section.id
    section = await section.save()
    await setSlugsPath(section)
  }
}

export async function populateSlugsForResource({
  resourceId,
}: {
  resourceId: string
}) {
  const [resource] = await Resource.find({ where: { id: resourceId }, take: 1 })
  if (!resource) {
    throw new Error('Invalid resource')
  }
  let baseSection = await resource.baseSection
  baseSection.slugsPath = ''
  baseSection.pathWithSectionIds = ''
  baseSection = await baseSection.save()
  await setSlugsPath(baseSection)
}
