import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn
} from 'typeorm'
import { Field, ID, ObjectType } from 'type-graphql'

import { Resource } from './Resource.entity'
import { Page } from './Page.entity'

@ObjectType()
@Entity()
export class Section extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Field()
  @Column()
  title: string

  @Field(() => Resource)
  @ManyToOne(
    () => Resource,
    (resource) => resource.sections
  )
  resource: Resource

  @Field(() => [Section])
  @OneToMany(
    () => Section,
    (section) => section.parentSection
  )
  subSections: Section[]

  @Field(() => Section, { nullable: true })
  @ManyToOne(
    () => Section,
    (section) => section.subSections
  )
  parentSection: Section

  @Field(() => Page, { nullable: true })
  @OneToOne(() => Page)
  @JoinColumn()
  page: Page

  @Field()
  isPage(): boolean {
    return !!this.page
  }

  @Field()
  isSection(): boolean {
    return !this.isPage()
  }

  @Field()
  isRoot(): boolean {
    return !this.parentSection
  }
}
