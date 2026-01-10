import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Post {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  authorId: Types.ObjectId;

  @Prop({ required: true })
  text: string;

  @Prop({ default: null })
  image: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  likes: Types.ObjectId[];

  @Prop({
    type: [
      {
        userId: { type: Types.ObjectId, ref: 'User', required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  comments: Array<{
    userId: Types.ObjectId;
    text: string;
    createdAt: Date;
  }>;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  savedBy: Types.ObjectId[];
}

export const PostSchema = SchemaFactory.createForClass(Post);

