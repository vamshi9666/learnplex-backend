import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm'
import { Field, ID, Int, ObjectType } from 'type-graphql'

import { Section } from './Section.entity'
import { User } from './User.entity'
import { Topic } from './Topic.entity'
import { slug } from '../utils/slug'

@ObjectType()
@Entity()
@Unique(['slug', 'userId'])
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
  @Column({ readonly: true, nullable: true })
  baseSectionId: string

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.resources)
  user: Promise<User>

  @Field(() => Topic)
  @ManyToOne(() => Topic, (topic) => topic.resources)
  topic: Promise<Topic>

  @Field()
  @Column('bool', { default: false })
  verified: boolean

  @Field({ nullable: true })
  @Column({ nullable: true })
  description: string

  @Field(() => Int)
  @Column({ readonly: true })
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

  @BeforeInsert()
  @BeforeUpdate()
  setSlug(): void {
    this.slug = slug(this.title)
  }

  async slugsForFirstPage(section: Section): Promise<string[]> {
    const subSections = await section.sections
    const filteredSubSections = subSections.filter((a) => !a.deleted)
    if (filteredSubSections.length === 0) {
      if (await section.isBaseSection()) {
        return []
      }
      return [section.slug]
    }
    const dummySection = new Section()
    dummySection.order = 1000000000
    const sectionWithLeastOrder = filteredSubSections.reduce(
      (a: Section, b) => {
        return a.order < b.order ? a : b
      }
    )
    const otherSlugs = await this.slugsForFirstPage(sectionWithLeastOrder)
    if (await section.isBaseSection()) {
      return otherSlugs
    }
    return [section.slug, ...otherSlugs]
  }

  @Field(() => String)
  async firstPageSlugsPath(): Promise<string> {
    const slugs = await this.slugsForFirstPage(await this.baseSection)
    if (slugs.length === 0) {
      return ''
    }
    return slugs.reduce((a, b) => `${a}/${b}`)
  }
}
