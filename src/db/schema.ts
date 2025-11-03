import { pgTable, text, varchar, timestamp, json, serial } from 'drizzle-orm/pg-core';

// Personal Information Table
export const personalInfo = pgTable('personal_info', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  linkedin: varchar('linkedin', { length: 255 }),
  bio: text('bio'),
  location: varchar('location', { length: 255 }),
  profileImageUrl: text('profile_image_url'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Work Experience Table
export const workExperience = pgTable('work_experience', {
  id: serial('id').primaryKey(),
  company: varchar('company', { length: 255 }).notNull(),
  role: varchar('role', { length: 255 }).notNull(),
  location: varchar('location', { length: 255 }),
  startDate: varchar('start_date', { length: 50 }).notNull(),
  endDate: varchar('end_date', { length: 50 }),
  achievements: json('achievements').$type<string[]>().notNull(),
  order: serial('order').notNull(),
});

// Education Table
export const education = pgTable('education', {
  id: serial('id').primaryKey(),
  institution: varchar('institution', { length: 255 }).notNull(),
  degree: varchar('degree', { length: 255 }).notNull(),
  location: varchar('location', { length: 255 }),
  graduationDate: varchar('graduation_date', { length: 50 }),
  order: serial('order').notNull(),
});

// Skills Table
export const skills = pgTable('skills', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  order: serial('order').notNull(),
});

// Projects Table
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  role: varchar('role', { length: 255 }),
  location: varchar('location', { length: 255 }),
  startDate: varchar('start_date', { length: 50 }),
  endDate: varchar('end_date', { length: 50 }),
  achievements: json('achievements').$type<string[]>().notNull(),
  techStack: json('tech_stack').$type<string[]>(),
  links: json('links').$type<{ label: string; url: string }[]>(),
  imageUrl: text('image_url'),
  type: varchar('type', { length: 50 }).notNull(), // 'professional' or 'personal'
  order: serial('order').notNull(),
});

// Currently Learning Table
export const currentlyLearning = pgTable('currently_learning', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Admin Sessions Table
export const adminSessions = pgTable('admin_sessions', {
  id: serial('id').primaryKey(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  userId: varchar('user_id', { length: 100 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  rememberMe: varchar('remember_me', { length: 10 }).notNull().default('false'),
  createdAt: timestamp('created_at').defaultNow(),
});
