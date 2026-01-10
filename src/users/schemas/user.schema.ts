import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../../common/enums/role.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ enum: Role, required: true })
  role: Role;

  @Prop({ default: null })
  profilePhoto: string;

  @Prop({ default: '' })
  bio: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add method to select password when needed
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

