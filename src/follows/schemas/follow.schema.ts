import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FollowDocument = Follow & Document;

@Schema({ timestamps: true })
export class Follow {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  worshiperId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  leaderId: Types.ObjectId;
}

export const FollowSchema = SchemaFactory.createForClass(Follow);

// Compound index to ensure one follow per pair
FollowSchema.index({ worshiperId: 1, leaderId: 1 }, { unique: true });

