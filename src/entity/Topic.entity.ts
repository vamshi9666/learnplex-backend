import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Field, ID, ObjectType } from 'type-graphql'

import { Resource } from './Resource.entity'
import { slug } from '../utils/slug'

@ObjectType()
@Entity()
export class Topic extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Field()
  @Column()
  title: string

  @Field(() => [Resource])
  @OneToMany(
    () => Resource,
    (resource) => resource.topic
  )
  resources: Promise<Resource[]>

  @Field()
  slug(): string {
    return slug(this.title)
  }
}
