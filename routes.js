const fetch = require("node-fetch");
const nodemailer = require("nodemailer");
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

require("dotenv").config();
const router = express.Router();

// ============================================
// CLOUDINARY CONFIGURATION
// ============================================
const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
};

// Log configuration status (without exposing secrets)
console.log('Cloudinary Config Status:', {
  cloud_name: cloudinaryConfig.cloud_name ? '✓ Set' : '✗ Missing',
  api_key: cloudinaryConfig.api_key ? '✓ Set' : '✗ Missing',
  api_secret: cloudinaryConfig.api_secret ? '✓ Set' : '✗ Missing'
});

cloudinary.config(cloudinaryConfig);

// ============================================
// TOKEN VERIFICATION MIDDLEWARE
// ============================================

// Verify admin token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "admin-secret-key-change-in-production");
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token." });
  }
};

// ============================================
// AUTHENTICATION ROUTES
// ============================================

// Admin Login
router.post("/auth/login", async (req, res) => {
  try {
    const { sql } = require("./db");
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // Get admin credentials from database
    const result = await sql`SELECT * FROM admins WHERE email = ${email}`;

    if (result.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const admin = result[0];

    // In production, use proper password hashing (bcrypt)
    // For demo, comparing plain password
    if (password !== admin.password) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role || 'admin' },
      process.env.JWT_SECRET || "admin-secret-key-change-in-production",
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name || "Admin"
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Login failed" });
  }
});

// Verify Token
router.get("/auth/verify", verifyToken, (req, res) => {
  res.json({ valid: true, admin: req.admin });
});

// ============================================
// FILE UPLOAD CONFIGURATION
// ============================================

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'portfolio-uploads',
      public_id: `${Date.now()}-${Math.round(Math.random() * 1E9)}`,
      resource_type: 'image'
    };
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per file
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

// Helper to build SEO response
const buildSeoResponse = (meta_title, meta_description, meta_keywords, sectionName) => {
  return {
    title: meta_title || `${sectionName} | Muhammad Hamid Raza`,
    description: meta_description || `Learn more about my ${sectionName.toLowerCase()} and professional journey.`,
    keywords: meta_keywords || "",
  };
};

// Helper to build paginated response
const buildPaginatedResponse = (items, page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  return {
    data: items,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(total),
      totalPages: totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    }
  };
};

// Helper to build data response
const buildResponse = (data, seo) => {
  return {
    data,
    seo,
  };
};

// ============================================
// PORTFOLIO CRUD APIs (NEW)
// ============================================

// ---- 1. HOME API (Single Record) ----

// GET Home
router.get("/home", async (req, res) => {
  try {
    const { sql } = require("./db");
    const result = await sql`SELECT * FROM home ORDER BY id DESC LIMIT 1`;
    const data = result[0] || null;
    const seo = buildSeoResponse(
      data?.meta_title,
      data?.meta_description,
      data?.meta_keywords,
      "Home"
    );
    res.json(buildResponse(data, seo));
  } catch (error) {
    console.error("Home GET error:", error);
    res.status(500).json({ error: "Failed to fetch home data" });
  }
});

// POST Home (Create or Update)
router.post("/home", verifyToken, async (req, res) => {
  try {
    const { sql } = require("./db");
    const {
      greeting,
      name,
      tagline,
      typed_roles,
      bio,
      profile_image,
      cv_link,
      github_link,
      linkedin_link,
      email,
      phone,
      meta_title,
      meta_description,
      meta_keywords,
    } = req.body;

    const existing = await sql`SELECT id FROM home ORDER BY id DESC LIMIT 1`;

    if (existing.length > 0) {
      await sql`
        UPDATE home SET
          greeting = ${greeting},
          name = ${name},
          tagline = ${tagline},
          typed_roles = ${JSON.stringify(typed_roles)},
          bio = ${bio},
          profile_image = ${profile_image},
          cv_link = ${cv_link},
          github_link = ${github_link},
          linkedin_link = ${linkedin_link},
          email = ${email},
          phone = ${phone},
          meta_title = ${meta_title},
          meta_description = ${meta_description},
          meta_keywords = ${meta_keywords},
          updated_at = NOW()
        WHERE id = ${existing[0].id}
      `;
      res.json({ message: "Home updated successfully" });
    } else {
      await sql`
        INSERT INTO home (
          greeting, name, tagline, typed_roles, bio,
          profile_image, cv_link, github_link, linkedin_link, email, phone,
          meta_title, meta_description, meta_keywords
        ) VALUES (
          ${greeting}, ${name}, ${tagline}, ${JSON.stringify(typed_roles)}, ${bio},
          ${profile_image}, ${cv_link}, ${github_link}, ${linkedin_link}, ${email}, ${phone},
          ${meta_title}, ${meta_description}, ${meta_keywords}
        )
      `;
      res.json({ message: "Home created successfully" });
    }
  } catch (error) {
    console.error("Home POST error:", error);
    res.status(500).json({ error: "Failed to save home data" });
  }
});

// DELETE Home
router.delete("/home/:id", verifyToken, async (req, res) => {
  try {
    const { sql } = require("./db");
    const { id } = req.params;
    await sql`DELETE FROM home WHERE id = ${id}`;
    res.json({ message: "Home record deleted successfully" });
  } catch (error) {
    console.error("Home DELETE error:", error);
    res.status(500).json({ error: "Failed to delete home record" });
  }
});

// ---- 2. ABOUT API (Single Record) ----

// GET About
router.get("/about", async (req, res) => {
  try {
    const { sql } = require("./db");
    const result = await sql`SELECT * FROM about ORDER BY id DESC LIMIT 1`;
    const data = result[0] || null;
    if (data && data.values) {
      data.values = JSON.parse(data.values);
    }
    const seo = buildSeoResponse(
      data?.meta_title,
      data?.meta_description,
      data?.meta_keywords,
      "About"
    );
    res.json(buildResponse(data, seo));
  } catch (error) {
    console.error("About GET error:", error);
    res.status(500).json({ error: "Failed to fetch about data" });
  }
});

// POST About (Create or Update)
router.post("/about", verifyToken, async (req, res) => {
  try {
    const { sql } = require("./db");
    const { title, subtitle, bio_text, bio_text_2, values, background_image, meta_title, meta_description, meta_keywords } = req.body;

    const existing = await sql`SELECT id FROM about ORDER BY id DESC LIMIT 1`;

    if (existing.length > 0) {
      await sql`
        UPDATE about SET
          title = ${title},
          subtitle = ${subtitle},
          bio_text = ${bio_text},
          bio_text_2 = ${bio_text_2},
          values = ${JSON.stringify(values)},
          background_image = ${background_image},
          meta_title = ${meta_title},
          meta_description = ${meta_description},
          meta_keywords = ${meta_keywords},
          updated_at = NOW()
        WHERE id = ${existing[0].id}
      `;
      res.json({ message: "About updated successfully" });
    } else {
      await sql`
        INSERT INTO about (
          title, subtitle, bio_text, bio_text_2, values, background_image,
          meta_title, meta_description, meta_keywords
        ) VALUES (
          ${title}, ${subtitle}, ${bio_text}, ${bio_text_2}, ${JSON.stringify(values)}, ${background_image},
          ${meta_title}, ${meta_description}, ${meta_keywords}
        )
      `;
      res.json({ message: "About created successfully" });
    }
  } catch (error) {
    console.error("About POST error:", error);
    res.status(500).json({ error: "Failed to save about data" });
  }
});

// DELETE About
router.delete("/about/:id", verifyToken, async (req, res) => {
  try {
    const { sql } = require("./db");
    const { id } = req.params;
    await sql`DELETE FROM about WHERE id = ${id}`;
    res.json({ message: "About record deleted successfully" });
  } catch (error) {
    console.error("About DELETE error:", error);
    res.status(500).json({ error: "Failed to delete about record" });
  }
});

// ---- 3. SKILLS API (Multiple Records) ----

// GET All Skills (with pagination & search)
router.get("/skills", async (req, res) => {
  try {
    const { sql } = require("./db");
    const page = parseInt(req.query.page) || 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : null;
    const search = req.query.search || "";

    let result;
    let total = 0;

    // If search query provided, search in database
    if (search) {
      const searchPattern = '%' + search + '%';

      // Get total count for searched items
      const countResult = await sql`SELECT COUNT(*) as total FROM skills WHERE name ILIKE ${searchPattern} OR category ILIKE ${searchPattern} OR description ILIKE ${searchPattern}`;
      total = countResult[0].total;

      if (!limit || limit >= 100) {
        result = await sql`SELECT * FROM skills WHERE name ILIKE ${searchPattern} OR category ILIKE ${searchPattern} OR description ILIKE ${searchPattern} ORDER BY id DESC`;
        res.json({ data: result, pagination: { total, page: 1, limit: total, totalPages: 1 }, seo: buildSeoResponse(null, null, null, "Skills") });
        return;
      }

      const offset = (page - 1) * limit;
      result = await sql`SELECT * FROM skills WHERE name ILIKE ${searchPattern} OR category ILIKE ${searchPattern} OR description ILIKE ${searchPattern} ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;

      const paginatedData = buildPaginatedResponse(result, page, limit, total);
      res.json({ ...paginatedData, seo: buildSeoResponse(null, null, null, "Skills") });
      return;
    }

    // If no limit provided (website skills page), return all skills
    if (!limit) {
      result = await sql`SELECT * FROM skills ORDER BY id DESC`;
      res.json({ data: result, seo: buildSeoResponse(null, null, null, "Skills") });
      return;
    }

    // If limit is 100 or more, return all skills without pagination
    if (limit >= 100) {
      result = await sql`SELECT * FROM skills ORDER BY id DESC`;
      res.json({ data: result, seo: buildSeoResponse(null, null, null, "Skills") });
      return;
    }

    // Get total count for pagination
    const countResult = await sql`SELECT COUNT(*) as total FROM skills`;
    total = countResult[0].total;

    // Get category counts for statistics
    const categoryCountsResult = await sql`
      SELECT category, COUNT(*) as count
      FROM skills
      GROUP BY category
    `;
    const categoryCounts = {
      frontend: 0,
      backend: 0,
      tools: 0,
      "ai-ml": 0,
      devops: 0
    };

    categoryCountsResult.forEach(row => {
      const cat = row.category.toLowerCase();
      const count = parseInt(row.count);

      if (cat.includes('frontend')) categoryCounts.frontend += count;
      else if (cat.includes('backend')) categoryCounts.backend += count;
      else if (cat.includes('ai') || cat.includes('ml')) categoryCounts["ai-ml"] += count;
      else if (cat.includes('devops')) categoryCounts.devops += count;
      else if (cat.includes('tools')) categoryCounts.tools += count;
    });

    // Otherwise use pagination
    const offset = (page - 1) * limit;
    result = await sql`SELECT * FROM skills ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;

    const seo = buildSeoResponse(null, null, null, "Skills");
    const paginatedData = buildPaginatedResponse(result, page, limit, total);

    res.json({ ...paginatedData, categoryCounts, seo });
  } catch (error) {
    console.error("Skills GET error:", error);
    res.status(500).json({ error: "Failed to fetch skills" });
  }
});

// GET Single Skill
router.get("/skills/:id", async (req, res) => {
  try {
    const { sql } = require("./db");
    const { id } = req.params;
    const result = await sql`SELECT * FROM skills WHERE id = ${id}`;
    if (result.length === 0) {
      return res.status(404).json({ error: "Skill not found" });
    }
    const seo = buildSeoResponse(
      result[0].meta_title,
      result[0].meta_description,
      result[0].meta_keywords,
      "Skills"
    );
    res.json(buildResponse(result[0], seo));
  } catch (error) {
    console.error("Skill GET error:", error);
    res.status(500).json({ error: "Failed to fetch skill" });
  }
});

// POST Skill
router.post("/skills", verifyToken, async (req, res) => {
  try {
    const { sql } = require("./db");
    const { name, category, level, description, icon, icon_url, color, meta_title, meta_description, meta_keywords } = req.body;
    const result = await sql`
      INSERT INTO skills (name, category, level, description, icon, icon_url, color, meta_title, meta_description, meta_keywords)
      VALUES (${name}, ${category}, ${level}, ${description}, ${icon}, ${icon_url}, ${color || 'primary'}, ${meta_title}, ${meta_description}, ${meta_keywords})
      RETURNING *
    `;
    res.status(201).json({ message: "Skill created successfully", data: result[0] });
  } catch (error) {
    console.error("Skill POST error:", error);
    res.status(500).json({ error: "Failed to create skill" });
  }
});

// PUT Skill
router.put("/skills/:id", verifyToken, async (req, res) => {
  try {
    const { sql } = require("./db");
    const { id } = req.params;
    const { name, category, level, description, icon, icon_url, color, meta_title, meta_description, meta_keywords } = req.body;
    const result = await sql`
      UPDATE skills SET
        name = ${name},
        category = ${category},
        level = ${level},
        description = ${description},
        icon = ${icon},
        icon_url = ${icon_url},
        color = ${color},
        meta_title = ${meta_title},
        meta_description = ${meta_description},
        meta_keywords = ${meta_keywords},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    if (result.length === 0) {
      return res.status(404).json({ error: "Skill not found" });
    }
    res.json({ message: "Skill updated successfully", data: result[0] });
  } catch (error) {
    console.error("Skill PUT error:", error);
    res.status(500).json({ error: "Failed to update skill" });
  }
});

// DELETE Skill
router.delete("/skills/:id", verifyToken, async (req, res) => {
  try {
    const { sql } = require("./db");
    const { id } = req.params;
    await sql`DELETE FROM skills WHERE id = ${id}`;
    res.json({ message: "Skill deleted successfully" });
  } catch (error) {
    console.error("Skill DELETE error:", error);
    res.status(500).json({ error: "Failed to delete skill" });
  }
});

// ---- 4. PROJECTS API (Multiple Records) ----

// GET All Projects (with pagination & search & category filter)
router.get("/projects", async (req, res) => {
  try {
    const { sql } = require("./db");
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const category = req.query.category || "";

    let result;
    let total = 0;

    // If category filter provided
    if (category && category !== "All") {
      result = await sql`SELECT * FROM projects WHERE category = ${category} ORDER BY id DESC`;
      result.forEach(p => {
        if (p.technologies) p.technologies = JSON.parse(p.technologies);
      });
      total = result.length;

      // If search also provided with category
      if (search) {
        const searchPattern = '%' + search + '%';
        result = await sql`SELECT * FROM projects WHERE category = ${category} AND (title ILIKE ${searchPattern} OR description ILIKE ${searchPattern} OR technologies ILIKE ${searchPattern}) ORDER BY id DESC`;
        result.forEach(p => {
          if (p.technologies) p.technologies = JSON.parse(p.technologies);
        });
        total = result.length;
      }

      // Handle pagination
      const offset = (page - 1) * limit;
      const paginatedResult = result.slice(offset, offset + limit);
      const paginatedData = buildPaginatedResponse(paginatedResult, page, limit, total);
      res.json({ ...paginatedData, seo: buildSeoResponse(null, null, null, "Projects") });
      return;
    }

    // If search query provided, search in database
    if (search) {
      const searchPattern = '%' + search + '%';
      result = await sql`SELECT * FROM projects WHERE title ILIKE ${searchPattern} OR description ILIKE ${searchPattern} OR technologies ILIKE ${searchPattern} OR category ILIKE ${searchPattern} ORDER BY id DESC`;
      result.forEach(p => {
        if (p.technologies) p.technologies = JSON.parse(p.technologies);
      });
      total = result.length;

      // Handle pagination for search
      const offset = (page - 1) * limit;
      const paginatedResult = result.slice(offset, offset + limit);
      const paginatedData = buildPaginatedResponse(paginatedResult, page, limit, total);
      res.json({ ...paginatedData, seo: buildSeoResponse(null, null, null, "Projects") });
      return;
    }

    // Get total count
    const countResult = await sql`SELECT COUNT(*) as total FROM projects`;
    total = countResult[0].total;

    // If limit is 100 or more, return all projects without pagination
    if (limit >= 100) {
      result = await sql`SELECT * FROM projects ORDER BY id DESC`;
      result.forEach(p => {
        if (p.technologies) p.technologies = JSON.parse(p.technologies);
      });
      res.json({ data: result, seo: buildSeoResponse(null, null, null, "Projects") });
      return;
    }

    // Otherwise use pagination
    const offset = (page - 1) * limit;
    result = await sql`SELECT * FROM projects ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;
    result.forEach(p => {
      if (p.technologies) p.technologies = JSON.parse(p.technologies);
    });

    const seo = buildSeoResponse(null, null, null, "Projects");
    const paginatedData = buildPaginatedResponse(result, page, limit, total);

    res.json({ ...paginatedData, seo });
  } catch (error) {
    console.error("Projects GET error:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// GET Featured Projects
router.get("/projects/featured", async (req, res) => {
  try {
    const { sql } = require("./db");
    const result = await sql`SELECT * FROM projects WHERE featured = true ORDER BY id ASC`;
    result.forEach(p => {
      if (p.technologies) p.technologies = JSON.parse(p.technologies);
    });
    res.json({ data: result });
  } catch (error) {
    console.error("Featured Projects GET error:", error);
    res.status(500).json({ error: "Failed to fetch featured projects" });
  }
});

// GET Single Project
router.get("/projects/:id", async (req, res) => {
  try {
    const { sql } = require("./db");
    const { id } = req.params;
    const result = await sql`SELECT * FROM projects WHERE id = ${id}`;
    if (result.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }
    if (result[0].technologies) result[0].technologies = JSON.parse(result[0].technologies);
    const seo = buildSeoResponse(
      result[0].meta_title,
      result[0].meta_description,
      result[0].meta_keywords,
      "Projects"
    );
    res.json(buildResponse(result[0], seo));
  } catch (error) {
    console.error("Project GET error:", error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

// POST Project
router.post("/projects", verifyToken, async (req, res) => {
  try {
    const { sql } = require("./db");
    const { title, description, technologies, category, live_demo, github_link, featured, color, image, images, meta_title, meta_description, meta_keywords } = req.body;
    const result = await sql`
      INSERT INTO projects (title, description, technologies, category, live_demo, github_link, featured, color, image, images, meta_title, meta_description, meta_keywords)
      VALUES (${title}, ${description}, ${JSON.stringify(technologies)}, ${category}, ${live_demo}, ${github_link}, ${featured || false}, ${color || 'primary'}, ${image}, ${images}, ${meta_title}, ${meta_description}, ${meta_keywords})
      RETURNING *
    `;
    res.status(201).json({ message: "Project created successfully", data: result[0] });
  } catch (error) {
    console.error("Project POST error:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
});

// PUT Project
router.put("/projects/:id", verifyToken, async (req, res) => {
  try {
    const { sql } = require("./db");
    const { id } = req.params;
    const { title, description, technologies, category, live_demo, github_link, featured, color, image, images, meta_title, meta_description, meta_keywords } = req.body;
    const result = await sql`
      UPDATE projects SET
        title = ${title},
        description = ${description},
        technologies = ${JSON.stringify(technologies)},
        category = ${category},
        live_demo = ${live_demo},
        github_link = ${github_link},
        featured = ${featured},
        color = ${color},
        image = ${image},
        images = ${images},
        meta_title = ${meta_title},
        meta_description = ${meta_description},
        meta_keywords = ${meta_keywords},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    if (result.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json({ message: "Project updated successfully", data: result[0] });
  } catch (error) {
    console.error("Project PUT error:", error);
    res.status(500).json({ error: "Failed to update project" });
  }
});

// DELETE Project
router.delete("/projects/:id", verifyToken, async (req, res) => {
  try {
    const { sql } = require("./db");
    const { id } = req.params;
    await sql`DELETE FROM projects WHERE id = ${id}`;
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Project DELETE error:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

// ---- 5. CONTRIBUTIONS API (Multiple Records - NEW) ----

// GET All Contributions (with pagination & search & type filter)
router.get("/contributions", async (req, res) => {
  try {
    const { sql } = require("./db");
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const search = req.query.search || "";
    const type = req.query.type || "";

    let result;
    let total = 0;

    // If type filter provided
    if (type && type !== "All") {
      result = await sql`SELECT * FROM contributions WHERE type = ${type} ORDER BY id DESC`;
      total = result.length;

      // If search also provided with type
      if (search) {
        const searchPattern = '%' + search + '%';
        result = await sql`SELECT * FROM contributions WHERE type = ${type} AND (title ILIKE ${searchPattern} OR description ILIKE ${searchPattern} OR project_name ILIKE ${searchPattern} OR issuer ILIKE ${searchPattern}) ORDER BY id DESC`;
        total = result.length;
      }

      // Handle pagination
      const offset = (page - 1) * limit;
      const paginatedResult = result.slice(offset, offset + limit);
      const paginatedData = buildPaginatedResponse(paginatedResult, page, limit, total);
      res.json({ ...paginatedData, seo: buildSeoResponse(null, null, null, "Contributions") });
      return;
    }

    // If search query provided, search in database
    if (search) {
      const searchPattern = '%' + search + '%';
      result = await sql`SELECT * FROM contributions WHERE title ILIKE ${searchPattern} OR description ILIKE ${searchPattern} OR project_name ILIKE ${searchPattern} OR issuer ILIKE ${searchPattern} OR type ILIKE ${searchPattern} ORDER BY id DESC`;
      total = result.length;

      // Handle pagination for search
      const offset = (page - 1) * limit;
      const paginatedResult = result.slice(offset, offset + limit);
      const paginatedData = buildPaginatedResponse(paginatedResult, page, limit, total);
      res.json({ ...paginatedData, seo: buildSeoResponse(null, null, null, "Contributions") });
      return;
    }

    const countResult = await sql`SELECT COUNT(*) as total FROM contributions`;
    total = countResult[0].total;

    // If limit is 100 or more, return all contributions without pagination
    if (limit >= 100) {
      result = await sql`SELECT * FROM contributions ORDER BY id DESC`;
      res.json({ data: result, seo: buildSeoResponse(null, null, null, "Contributions") });
      return;
    }

    // Otherwise use pagination
    const offset = (page - 1) * limit;
    result = await sql`SELECT * FROM contributions ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;

    const seo = buildSeoResponse(null, null, null, "Contributions");
    const paginatedData = buildPaginatedResponse(result, page, limit, total);

    res.json({ ...paginatedData, seo });
  } catch (error) {
    console.error("Contributions GET error:", error);
    res.status(500).json({ error: "Failed to fetch contributions" });
  }
});

// GET Single Contribution
router.get("/contributions/:id", async (req, res) => {
  try {
    const { sql } = require("./db");
    const { id } = req.params;
    const result = await sql`SELECT * FROM contributions WHERE id = ${id}`;
    if (result.length === 0) {
      return res.status(404).json({ error: "Contribution not found" });
    }
    const seo = buildSeoResponse(
      result[0].meta_title,
      result[0].meta_description,
      result[0].meta_keywords,
      "Contributions"
    );
    res.json(buildResponse(result[0], seo));
  } catch (error) {
    console.error("Contribution GET error:", error);
    res.status(500).json({ error: "Failed to fetch contribution" });
  }
});

// POST Contribution
router.post("/contributions", verifyToken, async (req, res) => {
  try {
    const { sql } = require("./db");
    const { title, description, project_name, issuer, type, link, image, images, meta_title, meta_description, meta_keywords } = req.body;
    const result = await sql`
      INSERT INTO contributions (title, description, project_name, issuer, type, link, image, images, meta_title, meta_description, meta_keywords)
      VALUES (${title}, ${description}, ${project_name}, ${issuer}, ${type}, ${link}, ${image}, ${images}, ${meta_title}, ${meta_description}, ${meta_keywords})
      RETURNING *
    `;
    res.status(201).json({ message: "Contribution created successfully", data: result[0] });
  } catch (error) {
    console.error("Contribution POST error:", error);
    res.status(500).json({ error: "Failed to create contribution" });
  }
});

// PUT Contribution
router.put("/contributions/:id", verifyToken, async (req, res) => {
  try {
    const { sql } = require("./db");
    const { id } = req.params;
    const { title, description, project_name, issuer, type, link, image, images, meta_title, meta_description, meta_keywords } = req.body;
    const result = await sql`
      UPDATE contributions SET
        title = ${title},
        description = ${description},
        project_name = ${project_name},
        issuer = ${issuer},
        type = ${type},
        link = ${link},
        image = ${image},
        images = ${images},
        meta_title = ${meta_title},
        meta_description = ${meta_description},
        meta_keywords = ${meta_keywords},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    if (result.length === 0) {
      return res.status(404).json({ error: "Contribution not found" });
    }
    res.json({ message: "Contribution updated successfully", data: result[0] });
  } catch (error) {
    console.error("Contribution PUT error:", error);
    res.status(500).json({ error: "Failed to update contribution" });
  }
});

// DELETE Contribution
router.delete("/contributions/:id", verifyToken, async (req, res) => {
  try {
    const { sql } = require("./db");
    const { id } = req.params;
    await sql`DELETE FROM contributions WHERE id = ${id}`;
    res.json({ message: "Contribution deleted successfully" });
  } catch (error) {
    console.error("Contribution DELETE error:", error);
    res.status(500).json({ error: "Failed to delete contribution" });
  }
});

// ---- 6. EXPERIENCE API (Multiple Records) ----

// GET All Experience
router.get("/experience", async (req, res) => {
  try {
    const { sql } = require("./db");
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const offset = (page - 1) * limit;

    const countResult = await sql`SELECT COUNT(*) as total FROM experience`;
    const total = countResult[0].total;

    const result = await sql`SELECT * FROM experience ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;
    result.forEach(e => {
      if (e.tech_stack) e.tech_stack = JSON.parse(e.tech_stack);
    });

    const seo = buildSeoResponse(null, null, null, "Experience");
    const paginatedData = buildPaginatedResponse(result, page, limit, total);

    res.json({ ...paginatedData, seo });
  } catch (error) {
    console.error("Experience GET error:", error);
    res.status(500).json({ error: "Failed to fetch experience" });
  }
});

// GET Single Experience
router.get("/experience/:id", async (req, res) => {
  try {
    const { sql } = require("./db");
    const { id } = req.params;
    const result = await sql`SELECT * FROM experience WHERE id = ${id}`;
    if (result.length === 0) {
      return res.status(404).json({ error: "Experience not found" });
    }
    if (result[0].tech_stack) result[0].tech_stack = JSON.parse(result[0].tech_stack);
    const seo = buildSeoResponse(
      result[0].meta_title,
      result[0].meta_description,
      result[0].meta_keywords,
      "Experience"
    );
    res.json(buildResponse(result[0], seo));
  } catch (error) {
    console.error("Experience GET error:", error);
    res.status(500).json({ error: "Failed to fetch experience" });
  }
});

// POST Experience
router.post("/experience", verifyToken, async (req, res) => {
  try {
    const { sql } = require("./db");
    const { company, role, duration, description, tech_stack, icon, color, company_logo, meta_title, meta_description, meta_keywords } = req.body;
    const result = await sql`
      INSERT INTO experience (company, role, duration, description, tech_stack, icon, color, company_logo, meta_title, meta_description, meta_keywords)
      VALUES (${company}, ${role}, ${duration}, ${description}, ${JSON.stringify(tech_stack)}, ${icon || 'fas fa-briefcase'}, ${color || 'primary'}, ${company_logo}, ${meta_title}, ${meta_description}, ${meta_keywords})
      RETURNING *
    `;
    res.status(201).json({ message: "Experience created successfully", data: result[0] });
  } catch (error) {
    console.error("Experience POST error:", error);
    res.status(500).json({ error: "Failed to create experience" });
  }
});

// PUT Experience
router.put("/experience/:id", verifyToken, async (req, res) => {
  try {
    const { sql } = require("./db");
    const { id } = req.params;
    const { company, role, duration, description, tech_stack, icon, color, company_logo, meta_title, meta_description, meta_keywords } = req.body;
    const result = await sql`
      UPDATE experience SET
        company = ${company},
        role = ${role},
        duration = ${duration},
        description = ${description},
        tech_stack = ${JSON.stringify(tech_stack)},
        icon = ${icon},
        color = ${color},
        company_logo = ${company_logo},
        meta_title = ${meta_title},
        meta_description = ${meta_description},
        meta_keywords = ${meta_keywords},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    if (result.length === 0) {
      return res.status(404).json({ error: "Experience not found" });
    }
    res.json({ message: "Experience updated successfully", data: result[0] });
  } catch (error) {
    console.error("Experience PUT error:", error);
    res.status(500).json({ error: "Failed to update experience" });
  }
});

// DELETE Experience
router.delete("/experience/:id", verifyToken, async (req, res) => {
  try {
    const { sql } = require("./db");
    const { id } = req.params;
    await sql`DELETE FROM experience WHERE id = ${id}`;
    res.json({ message: "Experience deleted successfully" });
  } catch (error) {
    console.error("Experience DELETE error:", error);
    res.status(500).json({ error: "Failed to delete experience" });
  }
});

// ---- 7. EDUCATION API (Multiple Records) ----

// GET All Education
router.get("/education", async (req, res) => {
  try {
    const { sql } = require("./db");
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const offset = (page - 1) * limit;

    const countResult = await sql`SELECT COUNT(*) as total FROM education`;
    const total = countResult[0].total;

    const result = await sql`SELECT * FROM education ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;
    result.forEach(e => {
      if (e.highlights) e.highlights = JSON.parse(e.highlights);
    });
    const seo = buildSeoResponse(null, null, null, "Education");
    const paginatedData = buildPaginatedResponse(result, page, limit, total);

    res.json({ ...paginatedData, seo });
  } catch (error) {
    console.error("Education GET error:", error);
    res.status(500).json({ error: "Failed to fetch education" });
  }
});

// GET Single Education
router.get("/education/:id", async (req, res) => {
  try {
    const { sql } = require("./db");
    const { id } = req.params;
    const result = await sql`SELECT * FROM education WHERE id = ${id}`;
    if (result.length === 0) {
      return res.status(404).json({ error: "Education not found" });
    }
    if (result[0].highlights) result[0].highlights = JSON.parse(result[0].highlights);
    const seo = buildSeoResponse(
      result[0].meta_title,
      result[0].meta_description,
      result[0].meta_keywords,
      "Education"
    );
    res.json(buildResponse(result[0], seo));
  } catch (error) {
    console.error("Education GET error:", error);
    res.status(500).json({ error: "Failed to fetch education" });
  }
});

// POST Education
router.post("/education", verifyToken, async (req, res) => {
  try {
    const { sql } = require("./db");
    const { institution, degree, period, description, highlights_title, highlights, icon, color, institution_logo, meta_title, meta_description, meta_keywords } = req.body;
    const result = await sql`
      INSERT INTO education (institution, degree, period, description, highlights_title, highlights, icon, color, institution_logo, meta_title, meta_description, meta_keywords)
      VALUES (${institution}, ${degree}, ${period}, ${description}, ${highlights_title}, ${JSON.stringify(highlights)}, ${icon || 'fas fa-university'}, ${color || 'primary'}, ${institution_logo}, ${meta_title}, ${meta_description}, ${meta_keywords})
      RETURNING *
    `;
    res.status(201).json({ message: "Education created successfully", data: result[0] });
  } catch (error) {
    console.error("Education POST error:", error);
    res.status(500).json({ error: "Failed to create education" });
  }
});

// PUT Education
router.put("/education/:id", verifyToken, async (req, res) => {
  try {
    const { sql } = require("./db");
    const { id } = req.params;
    const { institution, degree, period, description, highlights_title, highlights, icon, color, institution_logo, meta_title, meta_description, meta_keywords } = req.body;
    const result = await sql`
      UPDATE education SET
        institution = ${institution},
        degree = ${degree},
        period = ${period},
        description = ${description},
        highlights_title = ${highlights_title},
        highlights = ${JSON.stringify(highlights)},
        icon = ${icon},
        color = ${color},
        institution_logo = ${institution_logo},
        meta_title = ${meta_title},
        meta_description = ${meta_description},
        meta_keywords = ${meta_keywords},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    if (result.length === 0) {
      return res.status(404).json({ error: "Education not found" });
    }
    res.json({ message: "Education updated successfully", data: result[0] });
  } catch (error) {
    console.error("Education PUT error:", error);
    res.status(500).json({ error: "Failed to update education" });
  }
});

// DELETE Education
router.delete("/education/:id", verifyToken, async (req, res) => {
  try {
    const { sql } = require("./db");
    const { id } = req.params;
    await sql`DELETE FROM education WHERE id = ${id}`;
    res.json({ message: "Education deleted successfully" });
  } catch (error) {
    console.error("Education DELETE error:", error);
    res.status(500).json({ error: "Failed to delete education" });
  }
});

// ---- 8. CERTIFICATIONS API (Multiple Records) ----

// GET All Certifications
router.get("/certifications", async (req, res) => {
  try {
    const { sql } = require("./db");
    const result = await sql`SELECT * FROM certifications ORDER BY id ASC`;
    const seo = buildSeoResponse(
      "Certifications | Muhammad Hamid Raza",
      "Professional certifications earned by Muhammad Hamid Raza in AI, MERN Stack, and web development.",
      "certifications, courses, professional development, AI, MERN Stack"
    );
    res.json(buildResponse(result, seo));
  } catch (error) {
    console.error("Certifications GET error:", error);
    res.status(500).json({ error: "Failed to fetch certifications" });
  }
});

// POST Certification
router.post("/certifications", verifyToken, async (req, res) => {
  try {
    const { sql } = require("./db");
    const { title, issuer, color, certificate_image, issued_date, meta_title, meta_description, meta_keywords } = req.body;
    const result = await sql`
      INSERT INTO certifications (title, issuer, color, certificate_image, issued_date, meta_title, meta_description, meta_keywords)
      VALUES (${title}, ${issuer}, ${color || 'primary'}, ${certificate_image}, ${issued_date}, ${meta_title}, ${meta_description}, ${meta_keywords})
      RETURNING *
    `;
    res.status(201).json({ message: "Certification created successfully", data: result[0] });
  } catch (error) {
    console.error("Certification POST error:", error);
    res.status(500).json({ error: "Failed to create certification" });
  }
});

// PUT Certification
router.put("/certifications/:id", verifyToken, async (req, res) => {
  try {
    const { sql } = require("./db");
    const { id } = req.params;
    const { title, issuer, color, certificate_image, issued_date, meta_title, meta_description, meta_keywords } = req.body;
    const result = await sql`
      UPDATE certifications SET
        title = ${title},
        issuer = ${issuer},
        color = ${color},
        certificate_image = ${certificate_image},
        issued_date = ${issued_date},
        meta_title = ${meta_title},
        meta_description = ${meta_description},
        meta_keywords = ${meta_keywords},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    if (result.length === 0) {
      return res.status(404).json({ error: "Certification not found" });
    }
    res.json({ message: "Certification updated successfully", data: result[0] });
  } catch (error) {
    console.error("Certification PUT error:", error);
    res.status(500).json({ error: "Failed to update certification" });
  }
});

// DELETE Certification
router.delete("/certifications/:id", verifyToken, async (req, res) => {
  try {
    const { sql } = require("./db");
    const { id } = req.params;
    await sql`DELETE FROM certifications WHERE id = ${id}`;
    res.json({ message: "Certification deleted successfully" });
  } catch (error) {
    console.error("Certification DELETE error:", error);
    res.status(500).json({ error: "Failed to delete certification" });
  }
});

// ---- 9. CONTACT API (Single Record) ----

// GET Contact
router.get("/contact", async (req, res) => {
  try {
    const { sql } = require("./db");
    const result = await sql`SELECT * FROM contact ORDER BY id DESC LIMIT 1`;
    const data = result[0] || null;
    if (data) {
      if (data.contact_items) data.contact_items = JSON.parse(data.contact_items);
      if (data.social_links) data.social_links = JSON.parse(data.social_links);
    }
    const seo = buildSeoResponse(
      data?.meta_title,
      data?.meta_description,
      data?.meta_keywords,
      "Contact"
    );
    res.json(buildResponse(data, seo));
  } catch (error) {
    console.error("Contact GET error:", error);
    res.status(500).json({ error: "Failed to fetch contact data" });
  }
});

// POST Contact (Create or Update)
router.post("/contact", verifyToken, async (req, res) => {
  try {
    const { sql } = require("./db");
    const { contact_items, social_links, meta_title, meta_description, meta_keywords } = req.body;

    const existing = await sql`SELECT id FROM contact ORDER BY id DESC LIMIT 1`;

    if (existing.length > 0) {
      await sql`
        UPDATE contact SET
          contact_items = ${JSON.stringify(contact_items)},
          social_links = ${JSON.stringify(social_links)},
          meta_title = ${meta_title},
          meta_description = ${meta_description},
          meta_keywords = ${meta_keywords},
          updated_at = NOW()
        WHERE id = ${existing[0].id}
      `;
      res.json({ message: "Contact updated successfully" });
    } else {
      await sql`
        INSERT INTO contact (contact_items, social_links, meta_title, meta_description, meta_keywords)
        VALUES (${JSON.stringify(contact_items)}, ${JSON.stringify(social_links)}, ${meta_title}, ${meta_description}, ${meta_keywords})
      `;
      res.json({ message: "Contact created successfully" });
    }
  } catch (error) {
    console.error("Contact POST error:", error);
    res.status(500).json({ error: "Failed to save contact data" });
  }
});

// DELETE Contact
router.delete("/contact/:id", verifyToken, async (req, res) => {
  try {
    const { sql } = require("./db");
    const { id } = req.params;
    await sql`DELETE FROM contact WHERE id = ${id}`;
    res.json({ message: "Contact record deleted successfully" });
  } catch (error) {
    console.error("Contact DELETE error:", error);
    res.status(500).json({ error: "Failed to delete contact record" });
  }
});

// ---- 10. MEDIA API (Global) ----

// GET All Media
router.get("/media", async (req, res) => {
  try {
    const { sql } = require("./db");
    const { related_type, related_id } = req.query;
    let query = "SELECT * FROM media";
    const params = [];
    const conditions = [];

    if (related_type) {
      conditions.push(`related_type = $${params.length + 1}`);
      params.push(related_type);
    }
    if (related_id) {
      conditions.push(`related_id = $${params.length + 1}`);
      params.push(related_id);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    query += " ORDER BY created_at DESC";

    const result = await sql(query, ...params);
    res.json({ data: result });
  } catch (error) {
    console.error("Media GET error:", error);
    res.status(500).json({ error: "Failed to fetch media" });
  }
});

// POST Media
router.post("/media", verifyToken, async (req, res) => {
  try {
    const { sql } = require("./db");
    const { type, url, mime_type, size, related_type, related_id, alt_text } = req.body;
    const result = await sql`
      INSERT INTO media (type, url, mime_type, size, related_type, related_id, alt_text)
      VALUES (${type}, ${url}, ${mime_type}, ${size}, ${related_type}, ${related_id}, ${alt_text})
      RETURNING *
    `;
    res.status(201).json({ message: "Media created successfully", data: result[0] });
  } catch (error) {
    console.error("Media POST error:", error);
    res.status(500).json({ error: "Failed to create media" });
  }
});

// DELETE Media
router.delete("/media/:id", verifyToken, async (req, res) => {
  try {
    const { sql } = require("./db");
    const { id } = req.params;
    await sql`DELETE FROM media WHERE id = ${id}`;
    res.json({ message: "Media deleted successfully" });
  } catch (error) {
    console.error("Media DELETE error:", error);
    res.status(500).json({ error: "Failed to delete media" });
  }
});

// ---- RESET ALL DATA ----

router.delete("/reset-all", verifyToken, async (req, res) => {
  try {
    const { sql } = require("./db");
    // Delete in reverse order due to dependencies
    await sql`DELETE FROM media`;
    await sql`DELETE FROM contact`;
    await sql`DELETE FROM certifications`;
    await sql`DELETE FROM education`;
    await sql`DELETE FROM experience`;
    await sql`DELETE FROM contributions`;
    await sql`DELETE FROM projects`;
    await sql`DELETE FROM skills`;
    await sql`DELETE FROM about`;
    await sql`DELETE FROM home`;
    res.json({ message: "All data reset successfully" });
  } catch (error) {
    console.error("Reset error:", error);
    res.status(500).json({ error: "Failed to reset data" });
  }
});

// ============================================
// SMART PORTFOLIO AGENT CHAT (OpenAI Agent SDK + Gemini)
// ============================================

router.post("/agent-chat", async (req, res) => {
  console.log("Agent Chat endpoint hit");
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    // Check for Gemini API key
    const GEMINI_API_KEY = "AIzaSyBgTJDYlq-SXIjCC1UYPZ6eC3irLVNMMzg";
    if (!GEMINI_API_KEY) {
      console.log("Gemini API key not found");
      return res.status(500).json({ message: "Gemini API key is not configured" });
    }

    // Import and run the portfolio agent
    const { runPortfolioAgent } = require("./agent/portfolioAgent");

    console.log("Running portfolio agent with message:", message);

    // Run the agent with Gemini
    const response = await runPortfolioAgent(message, history || []);

    console.log("Agent response:", response);

    return res.status(200).json({
      response: response,
      agentUsed: true,
    });
  } catch (error) {
    console.error("Agent Chat error:", error);
    return res.status(500).json({
      message: "An error occurred while processing your request",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

router.get("/check", (req, res) => {
  res.status(200).json({
    message: "Server is running",
  });
});

// ============================================
// IMAGE UPLOAD ENDPOINT
// ============================================
router.post("/upload-image", verifyToken, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error("Multer/Upload error:", err);
      return res.status(500).json({
        error: "Upload failed",
        details: err.message
      });
    }
    handleUpload(req, res);
  });
});

function handleUpload(req, res) {
  try {
    console.log('Upload request received');
    console.log('File:', req.file ? 'Present' : 'Missing');

    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    // Cloudinary returns the URL in req.file.path
    const imageUrl = req.file.path;
    console.log('Upload successful, URL:', imageUrl);

    res.status(200).json({
      message: "Image uploaded successfully",
      url: imageUrl,
      filename: req.file.filename,
      cloudinary_id: req.file.filename
    });
  } catch (error) {
    console.error("Image upload error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      error: "Failed to upload image",
      details: error.message
    });
  }
}

// Contact form submission endpoint
router.post("/contact-form", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        message: "All fields are required: name, email, subject, message",
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "465"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Contact Form" <${process.env.SMTP_USER}>`,
      to: process.env.RECEIVER_EMAIL,
      subject: `[Portfolio] New Message: ${subject}`,
      html: `
        <h3>New Contact Request</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    res.status(200).json({ message: "Message sent successfully!" });
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({ message: "Failed to send message." });
  }
});

// Download CV endpoint
router.get(`/download-cv`, (req, res) => {
  res.status(200).json({ message: "CV download functionality available via client-side" });
});

module.exports = router;
