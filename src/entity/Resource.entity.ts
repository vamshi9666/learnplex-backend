import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm'
import { Field, ID, Int, ObjectType } from 'type-graphql'

import { Section } from './Section.entity'
import { User } from './User.entity'
import { Topic } from './Topic.entity'

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
  @Index()
  @Column()
  slug: string

  @Field()
  @Column('bool', { default: false })
  isFork: boolean

  @Field(() => User)
  @ManyToOne(() => Resource, (resource) => resource.forks)
  forkedFrom: Promise<Resource>

  @Field(() => Int, { nullable: true })
  @Column('int', { default: 0 })
  forkedVersion: number

  @Field(() => [Resource])
  @OneToMany(() => Resource, (resource) => resource.forkedFrom)
  forks: Promise<Resource[]>

  @Field(() => Section)
  @OneToOne(() => Section, (section) => section.resource)
  @JoinColumn()
  baseSection: Promise<Section>

  @Field(() => String)
  @Column()
  baseSectionId: string

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.resources)
  user: Promise<User>

  @Field(() => Topic)
  @ManyToOne(() => Topic, (topic) => topic.resources)
  topic: Promise<Topic>

  @Field(() => String)
  @Column()
  topicId: string

  @Field()
  @Column('bool', { default: false })
  verified: boolean

  @Field({ nullable: true })
  @Column({ nullable: true })
  description: string

  @Field(() => Int)
  @Column()
  userId: number

  @Field()
  @CreateDateColumn()
  createdDate: Date

  @Field()
  @UpdateDateColumn()
  updatedDate: Date

  @Field(() => Int)
  @VersionColumn()
  version: number

  @Field()
  @Column('bool', { default: false })
  published: boolean

  @Field(() => String)
  async firstPageSlugsPath(): Promise<string> {
    const baseSectionId = this.baseSectionId
    const sections = await Section.find({
      where: { parentSectionId: baseSectionId, deleted: false },
    })
    let firstSlugsPath = ''
    if (sections.length > 0) {
      const sectionWithMinOrder = sections.reduce((a, b) =>
        a.order < b.order ? a : b
      )
      firstSlugsPath = sectionWithMinOrder.firstLeafSlugsPath
    }
    return firstSlugsPath
  }
}
