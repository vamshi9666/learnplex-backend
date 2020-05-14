import {
  BaseEntity,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Field, ID, ObjectType } from 'type-graphql'

import { User } from './User.entity'
import { Section } from './Section.entity'
import { Resource } from './Resource.entity'

@ObjectType()
@Entity()
export class Progress extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.progressList)
  user: Promise<User>

  @Field(() => [Section])
  @ManyToMany(() => Section)
  @JoinTable()
  completedSections: Promise<Section[]>

  @Field(() => Resource)
  @ManyToOne(() => Resource)
  resource: Promise<Resource>
}
