import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChatDocument = Chat & Document;

@Schema({ timestamps: true })
export class Chat {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  worshiperId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  leaderId: Types.ObjectId;

  @Prop({ default: null })
  lastMessage: string;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

// Compound index to ensure one chat per pair
ChatSchema.index({ worshiperId: 1, leaderId: 1 }, { unique: true });

