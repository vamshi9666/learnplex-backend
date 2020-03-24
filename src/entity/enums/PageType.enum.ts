import { registerEnumType } from 'type-graphql'

export enum PageType {
  TEXT = 'TEXT',
  VIDEO = 'VIDEO',
  LINK = 'LINK',
  QUIZ = 'QUIZ',
}

registerEnumType(PageType, {
  name: 'PageType',
})
