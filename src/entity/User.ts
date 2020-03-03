import {Entity, PrimaryGeneratedColumn, Column, BaseEntity} from "typeorm";
import {Field, ID, ObjectType} from "type-graphql";

@ObjectType()
@Entity()
export class User extends BaseEntity {

    @Field(() => ID)
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Field()
    @Column()
    firstName: string;

    @Field()
    @Column()
    lastName: string;

    @Field()
    name(): string {
        return `${this.firstName} ${this.lastName}`
    }

    @Field()
    @Column("text", { unique: true })
    email: string;

    @Column()
    password: string;

    @Column("bool", { default: false })
    confirmed: boolean;

}
