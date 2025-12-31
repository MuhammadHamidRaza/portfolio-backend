// Complete Database Schema with Images & Full SEO
const { pgTable, serial, text, boolean, timestamp } = require("drizzle-orm/pg-core");

// =====================
// 1. HOME TABLE
// =====================
const home = pgTable("home", {
  id: serial("id").primaryKey(),
  greeting: text("greeting").notNull().default("Hello, I'm"),
  name: text("name").notNull().default("Muhammad Hamid Raza"),
  tagline: text("tagline").notNull(),
  typed_roles: text("typed_roles").notNull().default("[]"),
  bio: text("bio").notNull(),
  profile_image: text("profile_image"),
  cv_link: text("cv_link"),
  github_link: text("github_link"),
  linkedin_link: text("linkedin_link"),
  email: text("email"),
  phone: text("phone"),
  // SEO Fields - Full SEO
  meta_title: text("meta_title"),
  meta_description: text("meta_description"),
  meta_keywords: text("meta_keywords"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// =====================
// 2. ABOUT TABLE
// =====================
const about = pgTable("about", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().default("About Me"),
  subtitle: text("subtitle").notNull(),
  bio_text: text("bio_text").notNull(),
  bio_text_2: text("bio_text_2"),
  values: text("values").notNull(),
  background_image: text("background_image"),
  // SEO Fields
  meta_title: text("meta_title"),
  meta_description: text("meta_description"),
  meta_keywords: text("meta_keywords"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// =====================
// 3. SKILLS TABLE
// =====================
const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  level: text("level"),
  description: text("description"),
  icon: text("icon"),
  icon_url: text("icon_url"),
  color: text("color").default("primary"),
  // SEO Fields
  meta_title: text("meta_title"),
  meta_description: text("meta_description"),
  meta_keywords: text("meta_keywords"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// =====================
// 4. PROJECTS TABLE
// =====================
const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  technologies: text("technologies").notNull(),
  category: text("category"),
  live_demo: text("live_demo"),
  github_link: text("github_link"),
  featured: boolean("featured").default(false),
  color: text("color").default("primary"),
  // Images (Array stored as JSON)
  image: text("image"),
  images: text("images"),
  // SEO Fields
  meta_title: text("meta_title"),
  meta_description: text("meta_description"),
  meta_keywords: text("meta_keywords"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// =====================
// 5. CONTRIBUTIONS TABLE
// =====================
const contributions = pgTable("contributions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  project_name: text("project_name"),
  issuer: text("issuer"),
  type: text("type").notNull(),
  link: text("link"),
  // Images (Array stored as JSON)
  image: text("image"),
  images: text("images"),
  // SEO Fields
  meta_title: text("meta_title"),
  meta_description: text("meta_description"),
  meta_keywords: text("meta_keywords"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// =====================
// 6. EXPERIENCE TABLE
// =====================
const experience = pgTable("experience", {
  id: serial("id").primaryKey(),
  company: text("company").notNull(),
  role: text("role").notNull(),
  duration: text("duration").notNull(),
  description: text("description").notNull(),
  tech_stack: text("tech_stack").notNull(),
  icon: text("icon").default("fas fa-briefcase"),
  color: text("color").default("primary"),
  // Company Logo
  company_logo: text("company_logo"),
  // SEO Fields
  meta_title: text("meta_title"),
  meta_description: text("meta_description"),
  meta_keywords: text("meta_keywords"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// =====================
// 7. EDUCATION TABLE
// =====================
const education = pgTable("education", {
  id: serial("id").primaryKey(),
  institution: text("institution").notNull(),
  degree: text("degree").notNull(),
  period: text("period").notNull(),
  description: text("description").notNull(),
  highlights_title: text("highlights_title"),
  highlights: text("highlights").notNull(),
  icon: text("icon").default("fas fa-university"),
  color: text("color").default("primary"),
  // Institution Logo
  institution_logo: text("institution_logo"),
  // SEO Fields
  meta_title: text("meta_title"),
  meta_description: text("meta_description"),
  meta_keywords: text("meta_keywords"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// =====================
// 8. CERTIFICATIONS TABLE
// =====================
const certifications = pgTable("certifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  issuer: text("issuer").notNull(),
  color: text("color").default("primary"),
  // Certificate Image
  certificate_image: text("certificate_image"),
  issued_date: text("issued_date"),
  // SEO Fields
  meta_title: text("meta_title"),
  meta_description: text("meta_description"),
  meta_keywords: text("meta_keywords"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// =====================
// 9. CONTACT TABLE
// =====================
const contact = pgTable("contact", {
  id: serial("id").primaryKey(),
  contact_items: text("contact_items").notNull(),
  social_links: text("social_links").notNull(),
  // SEO Fields
  meta_title: text("meta_title"),
  meta_description: text("meta_description"),
  meta_keywords: text("meta_keywords"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// =====================
// 10. MEDIA TABLE (Global)
// =====================
const media = pgTable("media", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  url: text("url").notNull(),
  mime_type: text("mime_type"),
  size: text("size"),
  related_type: text("related_type").notNull(),
  related_id: text("related_id"),
  alt_text: text("alt_text"),
  created_at: timestamp("created_at").defaultNow(),
});

// =====================
// EXPORT ALL TABLES
// =====================
module.exports = {
  home,
  about,
  skills,
  projects,
  contributions,
  experience,
  education,
  certifications,
  contact,
  media,
};
