import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Field, ID, ObjectType } from 'type-graphql'

import { Section } from './Section.entity'
import { User } from './User.entity'
import { Topic } from './Topic.entity'
import { slug } from '../utils/slug'

@ObjectType()
@Entity()
export class Resource extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Field()
  @Column()
  title: string

  @Field()
  @Column()
  slug: string

  @Field()
  @Column('bool', { default: false })
  isFork: boolean

  @Field(() => User)
  @ManyToOne(
    () => Resource,
    (resource) => resource.forks
  )
  forkedFrom: Promise<Resource>

  @Field(() => [Resource])
  @OneToMany(
    () => Resource,
    (resource) => resource.forkedFrom
  )
  forks: Promise<Resource[]>

  @Field(() => Section)
  @OneToOne(
    () => Section,
    (section) => section.resource
  )
  @JoinColumn()
  baseSection: Promise<Section>

  @Field(() => User)
  @ManyToOne(
    () => User,
    (user) => user.resources
  )
  user: Promise<User>

  @Field(() => Topic)
  @ManyToOne(
    () => Topic,
    (topic) => topic.resources
  )
  topic: Promise<Topic>

  @Field()
  @Column('bool', { default: false })
  verified: boolean

  @BeforeInsert()
  @BeforeUpdate()
  setSlug(): void {
    this.slug = slug(this.title)
  }
}
