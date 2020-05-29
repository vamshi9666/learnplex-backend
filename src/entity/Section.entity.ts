import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
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

import { Resource } from './Resource.entity'
import { Page } from './Page.entity'
import { slug } from '../utils/slug'

@ObjectType()
@Entity()
@Index(['baseSectionId', 'deleted'])
@Index(['id', 'deleted'])
@Index(['baseSectionId', 'slugsPath', 'deleted'])
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

  @Field()
  @Column('bool', { default: false })
  isFork: boolean

  @Field(() => Int)
  @Column('int', { default: 0 })
  order: number

  @Field(() => Int)
  @Column('int', { default: -1 })
  depth: number

  @Field(() => Resource, { nullable: true })
  @OneToOne(() => Resource, (resource) => resource.baseSection)
  resource: Promise<Resource>

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  resourceId: string

  @Field(() => [Section])
  @OneToMany(() => Section, (section) => section.parentSection)
  sections: Promise<Section[]>

  @Field(() => Section, { nullable: true })
  @ManyToOne(() => Section, (section) => section.sections)
  parentSection: Promise<Section>

  @Field(() => String, { nullable: true })
  @Column({ readonly: true, nullable: true })
  parentSectionId: string

  @Field(() => Section, { nullable: true })
  @ManyToOne(() => Section)
  baseSection: Promise<Section>

  @Field(() => String, { nullable: true })
  @Column({ readonly: true, nullable: true })
  baseSectionId: string

  @Field(() => Page, { nullable: true })
  @OneToOne(() => Page)
  @JoinColumn()
  page: Promise<Page>

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  pageId: string

  @Field()
  @CreateDateColumn()
  createdDate: Date

  @Field()
  @UpdateDateColumn()
  updatedDate: Date

  @Field(() => Int)
  @VersionColumn()
  version: number

  @Field(() => Int, { nullable: true })
  @Column('int', { default: 0 })
  forkedVersion: number

  @Field()
  @Column({ default: '' })
  slugsPath: string

  @Field()
  @Column({ default: '' })
  pathWithSectionIds: string

  @Field()
  @Column({ default: '' })
  previousSectionId: string

  @Field()
  @Column({ default: '' })
  nextSectionId: string

  @Field()
  @Column({ default: '' })
  firstLeafSectionId: string

  @Field()
  @Column({ default: '' })
  firstLeafSlugsPath: string

  @Field()
  @Column({ default: '' })
  lastLeafSectionId: string

  @Field()
  @Column({ default: '' })
  lastLeafSlugsPath: string

  @Field(() => String)
  async nextSectionToGoTo(): Promise<string> {
    if (!this.nextSectionId) {
      return ''
    }
    const [nextSection] = await Section.find({
      where: { id: this.nextSectionId, deleted: false },
    })
    if (!nextSection) {
      return ''
    }
    return nextSection.firstLeafSectionId
  }

  @Field(() => String)
  async previousSectionToGoTo(): Promise<string> {
    if (!this.previousSectionId) {
      return ''
    }
    const [previousSection] = await Section.find({
      where: { id: this.previousSectionId, deleted: false },
    })
    if (!previousSection) {
      return ''
    }
    return previousSection.lastLeafSectionId
  }

  @Field(() => String)
  async previousSectionPath(): Promise<string> {
    const previousSectionId = await this.previousSectionToGoTo()
    if (!previousSectionId) return ''
    const [previousSection] = await Section.find({
      where: { id: previousSectionId, deleted: false },
      take: 1,
    })
    if (!previousSection) return ''
    return previousSection.slugsPath
  }

  @Field(() => String)
  async nextSectionPath(): Promise<string> {
    const nextSectionId = await this.nextSectionToGoTo()
    if (!nextSectionId) return ''
    const [nextSection] = await Section.find({
      where: { id: nextSectionId, deleted: false },
      take: 1,
    })
    if (!nextSection) return ''
    return nextSection.slugsPath
  }

  @Field(() => Boolean)
  async isPage(): Promise<boolean> {
    return !!this.pageId
  }

  @Field(() => Boolean)
  async hasSubSections(): Promise<boolean> {
    const subSections = await this.sections
    const filteredSubSections = subSections.filter((a) => !a.deleted)
    return filteredSubSections.length > 0
  }

  @Field()
  isSection(): boolean {
    return !this.isPage()
  }

  @Field(() => Boolean)
  async isBaseSection(): Promise<boolean> {
    return this.order === -1
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
  async getDepth(): Promise<number> {
    if (await this.isBaseSection()) {
      return -1
    }
    if (await this.isRoot()) {
      return 0
    }
    const parent = await this.parentSection
    const parentDepth = await parent.getDepth()
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
    if (this.isFork) {
      return
    }
    if (!(await this.parentSection)) {
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
