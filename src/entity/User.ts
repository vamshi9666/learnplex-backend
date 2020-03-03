import {Field, ID, ObjectType} from "type-graphql";
import {Entity, PrimaryGeneratedColumn, Column, BaseEntity} from "typeorm";

@ObjectType()
@Entity("users")
export class User extends BaseEntity {

    @Field(() => ID)
    @PrimaryGeneratedColumn()
    id: number;

    @Field()
    @Column()
    firstName: string;

    @Field()
    @Column()
    lastName: string;

    @Column("int", { default: 0 })
    tokenVersion: number;

    @Field()
    name(): string {
        return `${this.firstName} ${this.lastName}`
    }

    @Field()
    @Column("text", { unique: true })
    email: string;

    @Field()
    @Column("text", { unique: true })
    username: string;

    @Column()
    password: string;

    @Column("bool", { default: false })
    confirmed: boolean;

}
