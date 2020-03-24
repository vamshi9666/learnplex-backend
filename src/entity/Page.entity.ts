import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { Field, ID, ObjectType } from 'type-graphql'

import { PageType } from './enums/PageType.enum'

@ObjectType()
@Entity()
export class Page extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Field()
  @Column()
  content: string

  @Field(() => PageType)
  @Column({
    type: 'enum',
    enum: PageType,
    default: PageType.TEXT,
  })
  type: PageType
}
