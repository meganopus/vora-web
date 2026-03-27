// Enums converted from Prisma PostgreSQL schema to standard TS enums for SQLite compatibility

export enum Theme {
  LIGHT = 'LIGHT',
  DARK = 'DARK',
  SYSTEM = 'SYSTEM',
}

export enum Frequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

export enum Mood {
  HAPPY = 'HAPPY',
  PROUD = 'PROUD',
  WORRIED = 'WORRIED',
  ANNOYED = 'ANNOYED',
  SAD = 'SAD',
  ANGRY = 'ANGRY',
}

export enum Priority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum Recurrence {
  NONE = 'NONE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  CUSTOM = 'CUSTOM',
}

export enum Activity {
  SHORT_BREAK = 'SHORT_BREAK',
  DEEP_BREATHING = 'DEEP_BREATHING',
  CALMING_MUSIC = 'CALMING_MUSIC',
  TALK_TO_SOMEONE = 'TALK_TO_SOMEONE',
  GO_FOR_WALK = 'GO_FOR_WALK',
  STAY_HYDRATED = 'STAY_HYDRATED',
}
