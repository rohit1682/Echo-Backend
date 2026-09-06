import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AuthProvider, ThemePreference } from '../../../common/enums';

export type UserDocument = HydratedDocument<User>;

/** A linked external identity (Google/Apple/phone) for a user. */
@Schema({ _id: false })
export class LinkedAuthProvider {
  @Prop({ type: String, enum: AuthProvider, required: true })
  provider: AuthProvider;

  /** Provider-specific stable id (Google `sub`, Apple `sub`, or phone number). */
  @Prop({ required: true })
  providerId: string;
}
const LinkedAuthProviderSchema = SchemaFactory.createForClass(LinkedAuthProvider);

/** Per-user reminder lead times (days before) applied by default to new items. */
@Schema({ _id: false })
export class ReminderDefaults {
  @Prop({ type: [Number], default: [0, 1, 7] })
  daysBefore: number[];
}
const ReminderDefaultsSchema = SchemaFactory.createForClass(ReminderDefaults);

/** Embedded user preferences (theme, sync, security, reminders). */
@Schema({ _id: false })
export class UserPreferences {
  @Prop({ type: String, enum: ThemePreference, default: ThemePreference.SYSTEM })
  theme: ThemePreference;

  @Prop({ default: 'INR' })
  currency: string;

  @Prop({ default: false })
  biometricLockEnabled: boolean;

  @Prop({ default: false })
  syncContacts: boolean;

  @Prop({ default: false })
  syncCalendar: boolean;

  @Prop({ type: ReminderDefaultsSchema, default: () => ({}) })
  reminderDefaults: ReminderDefaults;
}
const UserPreferencesSchema = SchemaFactory.createForClass(UserPreferences);

@Schema({ timestamps: true })
export class User {
  @Prop({ trim: true })
  name?: string;

  @Prop({ lowercase: true, trim: true, sparse: true, unique: true })
  email?: string;

  @Prop({ trim: true, sparse: true, unique: true })
  phone?: string;

  /** bcrypt hash; absent for social-only accounts. Never returned to clients. */
  @Prop({ select: false })
  passwordHash?: string;

  @Prop()
  avatarUrl?: string;

  @Prop({ type: [LinkedAuthProviderSchema], default: [] })
  authProviders: LinkedAuthProvider[];

  /** Hashed current refresh token (rotation). Never returned to clients. */
  @Prop({ select: false })
  refreshTokenHash?: string;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop({ default: false })
  phoneVerified: boolean;

  /** Reserved for 2FA (near-term); shape kept minimal for now. */
  @Prop({ type: Object, default: { enabled: false } })
  twoFactor: { enabled: boolean; secret?: string };

  @Prop({ type: UserPreferencesSchema, default: () => ({}) })
  preferences: UserPreferences;

  /** Expo push tokens for this user's devices (free push delivery). */
  @Prop({ type: [String], default: [] })
  expoPushTokens: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);

// Strip sensitive fields whenever a user is serialized to JSON.
UserSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: Record<string, any>) => {
    delete ret.passwordHash;
    delete ret.refreshTokenHash;
    delete ret.__v;
    return ret;
  },
});
