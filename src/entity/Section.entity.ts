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
import { Field, ID, Int, ObjectType } from 'type-graphql'

import { Resource } from './Resource.entity'
import { Page } from './Page.entity'
import { slug } from '../utils/slug'

@ObjectType()
@Entity()
export class Section extends BaseEntity {
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
  deleted: boolean

  @Field(() => Int)
  @Column('int', { default: 0 })
  order: number

  @Field(() => Resource, { nullable: true })
  @OneToOne(
    () => Resource,
    (resource) => resource.baseSection
  )
  resource: Promise<Resource>

  @Field(() => [Section])
  @OneToMany(
    () => Section,
    (section) => section.parentSection
  )
  sections: Promise<Section[]>

  @Field(() => Section, { nullable: true })
  @ManyToOne(
    () => Section,
    (section) => section.sections
  )
  parentSection: Promise<Section>

  @Field(() => Section, { nullable: true })
  @ManyToOne(() => Section)
  baseSection: Promise<Section>

  @Field(() => Page, { nullable: true })
  @OneToOne(() => Page)
  @JoinColumn()
  page: Promise<Page>

  @Field(() => Boolean)
  async isPage(): Promise<boolean> {
    const subSections = await this.sections
    return subSections.length == 0
  }

  @Field()
  isSection(): boolean {
    return !this.isPage()
  }

  @Field(() => Boolean)
  async isBaseSection(): Promise<boolean> {
    return !(await this.parentSection)
  }

  @Field(() => Boolean)
  async isRoot(): Promise<boolean> {
    const parentSection = await this.parentSection
    const baseSection = await this.baseSection
    if (!parentSection || !baseSection) {
      return false
    }
    return parentSection.id === baseSection.id
  }

  @Field(() => Int)
  async depth(): Promise<number> {
    if (await this.isBaseSection()) {
      return -1
    }
    if (await this.isRoot()) {
      return 0
    }
    const parent = await this.parentSection
    const parentDepth = await parent.depth()
    return parentDepth + 1
  }

  @Field(() => Boolean)
  async isDeleted(): Promise<boolean> {
    const parent = await this.parentSection
    let parentDeleted = false
    if (parent) {
      parentDeleted = await parent.isDeleted()
    }
    return this.deleted || parentDeleted
  }

  @Field(() => [Section])
  async filteredSections(): Promise<Section[]> {
    const sections = await this.sections
    return sections
      .filter((section) => !section.deleted)
      .sort((section, anotherSection) => {
        if (section.order > anotherSection.order) {
          return 1
        }
        if (section.order < anotherSection.order) {
          return -1
        }
        return 0
      })
  }

  @BeforeInsert()
  async setOrder(): Promise<void> {
    if (await this.isBaseSection()) {
      this.order = -1
    } else if (await this.isRoot()) {
      const baseSection = await this.baseSection
      this.order = (await baseSection.sections).length
    } else {
      const parent = await this.parentSection
      this.order = (await parent.sections).length
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  setSlug(): void {
    this.slug = slug(this.title)
  }
}
