import {
  BaseEntity,
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Field, ID, ObjectType } from 'type-graphql'

import { PageType } from './enums/PageType.enum'
import { Section } from './Section.entity'

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

  @Field()
  @Column('bool', { default: false })
  isFork: boolean

  @Field(() => Section)
  @OneToOne(() => Section)
  section: Promise<Section>

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  sectionId: string
}
