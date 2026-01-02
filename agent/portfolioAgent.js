/**
 * ==========================================
 * SMART PORTFOLIO AGENT (100% Working)
 * OpenAI Agents SDK + Gemini
 * ==========================================
 * Features:
 * ├── Knowledge Base (CV, projects, skills from DB)
 * ├── Tools: Projects, Skills, Experience, Contact, Search, Schedule Meeting
 * ├── Personality: Professional but friendly
 * └── Context: Knows everything about Hamid
 * ==========================================
 * Author: Muhammad Hamid Raza
 */

// ================================
// IMPORTS
// ================================
const { z } = require("zod");
const { Agent, Runner, OpenAIChatCompletionsModel, tool } = require("@openai/agents");
const { OpenAI } = require("openai");
const { sql } = require("../db");

// ================================
// GEMINI CONFIGURATION
// ================================
const BASE_URL = process.env.EXAMPLE_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/';
const API_KEY = "AIzaSyB1ULwuM--HFrx4ah2Yxp28MUpKEdUl2NU"
const MODEL_NAME = 'gemini-2.5-flash';




const client = new OpenAI({
  apiKey: API_KEY,
  baseURL: BASE_URL,
});

const model = new OpenAIChatCompletionsModel(client, MODEL_NAME);

// ================================
// SMART PORTFOLIO AGENT TOOLS
// ================================

// 1. get_profile() - Get personal profile info
const getProfileTool = tool({
  name: "get_profile",
  description: "Get Hamid's complete profile information - name, bio, greetings, typed roles, social links, CV download",
  parameters: z.object({}),
  async execute() {
    const r = await sql`SELECT * FROM home ORDER BY id DESC LIMIT 1`;
    if (!r.length) return "Profile not found";
    return JSON.stringify(r[0]);
  },
});

// 2. get_about() - Get about section
const getAboutTool = tool({
  name: "get_about",
  description: "Get detailed about information - background story, values, mission",
  parameters: z.object({}),
  async execute() {
    const r = await sql`SELECT * FROM about ORDER BY id DESC LIMIT 1`;
    if (!r.length) return "About not found";
    return JSON.stringify(r[0]);
  },
});

// 3. get_skills() - Fetch skills with optional category filter
const getSkillsTool = tool({
  name: "get_skills",
  description: "Get Hamid's skills. Can filter by category (Frontend, Backend, AI/ML, DevOps, Tools) or get all skills",
  parameters: z.object({
    category: z.string().optional().describe("Filter skills by category: Frontend, Backend, AI/ML, DevOps, Tools, Database"),
  }),
  async execute({ category }) {
    if (category) {
      return JSON.stringify(
        await sql`SELECT * FROM skills WHERE category ILIKE ${'%' + category + '%'} ORDER BY level DESC`
      );
    }
    return JSON.stringify(await sql`SELECT * FROM skills ORDER BY category, level DESC`);
  },
});

// 4. get_projects() - Fetch projects with filters
const getProjectsTool = tool({
  name: "get_projects",
  description: "Get Hamid's projects. Can filter by featured status, search by title or tech stack",
  parameters: z.object({
    featured: z.boolean().optional().describe("Get only featured/flagship projects"),
    search: z.string().optional().describe("Search projects by title or technology"),
    category: z.string().optional().describe("Filter by project category"),
  }),
  async execute({ featured, search, category }) {
    let r;
    if (featured) {
      r = await sql`SELECT * FROM projects WHERE featured = true ORDER BY id DESC`;
    } else if (search) {
      r = await sql`SELECT * FROM projects WHERE title ILIKE ${'%' + search + '%'} OR technologies ILIKE ${'%' + search + '%'} ORDER BY id DESC`;
    } else if (category) {
      r = await sql`SELECT * FROM projects WHERE category ILIKE ${'%' + category + '%'} ORDER BY id DESC`;
    } else {
      r = await sql`SELECT * FROM projects ORDER BY id DESC LIMIT 10`;
    }
    return JSON.stringify(r);
  },
});

// 5. get_project_details() - Get specific project details
const getProjectDetailsTool = tool({
  name: "get_project_details",
  description: "Get detailed information about a specific project by ID or title",
  parameters: z.object({
    projectId: z.number().optional().describe("Project ID"),
    projectTitle: z.string().optional().describe("Project title to search"),
  }),
  async execute({ projectId, projectTitle }) {
    let r;
    if (projectId) {
      r = await sql`SELECT * FROM projects WHERE id = ${projectId}`;
    } else if (projectTitle) {
      r = await sql`SELECT * FROM projects WHERE title ILIKE ${'%' + projectTitle + '%'} LIMIT 1`;
    } else {
      return "Please provide either projectId or projectTitle";
    }
    return r.length ? JSON.stringify(r[0]) : "Project not found";
  },
});

// 6. get_experience() - Get work history
const getExperienceTool = tool({
  name: "get_experience",
  description: "Get Hamid's work experience, companies, roles, tech stack used",
  parameters: z.object({}),
  async execute() {
    return JSON.stringify(await sql`SELECT * FROM experience ORDER BY id DESC`);
  },
});

// 7. get_education() - Get education details
const getEducationTool = tool({
  name: "get_education",
  description: "Get Hamid's education background - degrees, institutions, achievements",
  parameters: z.object({}),
  async execute() {
    return JSON.stringify(await sql`SELECT * FROM education ORDER BY id DESC`);
  },
});

// 8. get_certifications() - Get certifications
const getCertificationsTool = tool({
  name: "get_certifications",
  description: "Get Hamid's professional certifications and courses completed",
  parameters: z.object({}),
  async execute() {
    return JSON.stringify(await sql`SELECT * FROM certifications ORDER BY id DESC`);
  },
});

// 9. get_contributions() - Get open source contributions
const getContributionsTool = tool({
  name: "get_contributions",
  description: "Get Hamid's open source contributions - documentation, PRs, code contributions to projects like OpenAI, n8n",
  parameters: z.object({
    type: z.string().optional().describe("Filter by type: Documentation, Code, PR"),
  }),
  async execute({ type }) {
    if (type) {
      return JSON.stringify(
        await sql`SELECT * FROM contributions WHERE type ILIKE ${'%' + type + '%'} ORDER BY id DESC`
      );
    }
    return JSON.stringify(await sql`SELECT * FROM contributions ORDER BY id DESC`);
  },
});

// 10. get_contact() - Get contact information
const getContactTool = tool({
  name: "get_contact",
  description: "Get Hamid's contact information - email, phone, social links, location",
  parameters: z.object({}),
  async execute() {
    const r = await sql`SELECT * FROM contact ORDER BY id DESC LIMIT 1`;
    return r.length ? JSON.stringify(r[0]) : "Contact not found";
  },
});

// 11. search_portfolio() - Smart search across all portfolio data
const searchPortfolioTool = tool({
  name: "search_portfolio",
  description: "Search entire portfolio - projects, skills, experience, contributions. Use when user asks broadly",
  parameters: z.object({
    query: z.string().describe("Search query to find matching items"),
  }),
  async execute({ query }) {
    const q = '%' + query + '%';
    const r = await sql`
      SELECT 'project' as type, title as name, description, id FROM projects WHERE title ILIKE ${q} OR description ILIKE ${q}
      UNION
      SELECT 'skill' as type, name, category, NULL as description, id FROM skills WHERE name ILIKE ${q} OR category ILIKE ${q}
      UNION
      SELECT 'experience' as type, company as name, role as description, id FROM experience WHERE company ILIKE ${q} OR role ILIKE ${q}
      UNION
      SELECT 'contribution' as type, title as name, description, id FROM contributions WHERE title ILIKE ${q} OR project_name ILIKE ${q}
      LIMIT 10
    `;
    return r.length ? JSON.stringify(r) : "No results found";
  },
});

// 12. search_projects() - Find specific projects
const searchProjectsTool = tool({
  name: "search_projects",
  description: "Search specifically for projects by title, technology, or description",
  parameters: z.object({
    query: z.string().describe("Search term for finding projects"),
  }),
  async execute({ query }) {
    const q = '%' + query + '%';
    const r = await sql`
      SELECT * FROM projects
      WHERE title ILIKE ${q} OR description ILIKE ${q} OR technologies ILIKE ${q} OR category ILIKE ${q}
      ORDER BY featured DESC, id DESC
      LIMIT 5
    `;
    return r.length ? JSON.stringify(r) : "No matching projects found";
  },
});

// 13. get_availability() - Check availability status
const getAvailabilityTool = tool({
  name: "get_availability",
  description: "Get Hamid's current availability status for new opportunities",
  parameters: z.object({}),
  async execute() {
    // Return availability info (can be made dynamic later)
    return JSON.stringify({
      status: "Available for new opportunities",
      type: "Full-time / Contract / Freelance",
      response_time: "Within 24-48 hours",
      preferred_roles: ["Full Stack Developer", "AI Engineer", "Technical Lead"],
    });
  },
});

// 14. schedule_meeting() - Calendar integration (placeholder)
const scheduleMeetingTool = tool({
  name: "schedule_meeting",
  description: "Schedule a meeting with Hamid. Collect meeting details and provide contact for scheduling",
  parameters: z.object({
    date: z.string().optional().describe("Preferred meeting date"),
    time: z.string().optional().describe("Preferred meeting time"),
    topic: z.string().optional().describe("Meeting topic/agenda"),
    name: z.string().optional().describe("Requester name"),
    email: z.string().optional().describe("Requester email"),
  }),
  async execute({ date, time, topic, name, email }) {
    // Return meeting scheduling information
    return JSON.stringify({
      message: "Meeting request received! To finalize, please:",
      instructions: [
        "1. Send an email to hamidsidtechno@gmail.com",
        "2. Include your name, preferred date/time, and meeting topic",
        "3. I'll confirm within 24 hours",
      ],
      email: "hamidsidtechno@gmail.com",
      calendar_link: "Email to schedule",
      subject: `Meeting Request: ${topic || "Portfolio Discussion"}`,
    });
  },
});

// 15. get_tech_stack() - Get recommended tech stack info
const getTechStackTool = tool({
  name: "get_tech_stack",
  description: "Get Hamid's primary tech stack and recommendations based on project requirements",
  parameters: z.object({
    project_type: z.string().optional().describe("Type of project to get tech stack recommendations for"),
  }),
  async execute({ project_type }) {
    const skills = await sql`SELECT * FROM skills ORDER BY level DESC LIMIT 20`;
    const tech_stack = {
      frontend: skills.filter(s => s.category === 'Frontend').map(s => s.name),
      backend: skills.filter(s => s.category === 'Backend').map(s => s.name),
      database: skills.filter(s => s.category === 'Database').map(s => s.name),
      ai_ml: skills.filter(s => s.category === 'AI/ML').map(s => s.name),
      tools: skills.filter(s => s.category === 'Tools').map(s => s.name),
      recommendations: {
        mern: "MongoDB, Express, React, Node.js - Great for full-stack web apps",
        nextjs: "Next.js + PostgreSQL - Excellent for SEO and performance",
        ai_agents: "OpenAI Agent SDK + LangChain + Vector DB - For AI-powered applications",
      }
    };
    return JSON.stringify(tech_stack);
  },
});

// ================================
// AGENT PERSONALITY & INSTRUCTIONS
// ================================

const instructions = `You are Hamid's AI Portfolio Assistant - a smart, professional, and helpful agent.

## Your Role
You represent Muhammad Hamid Raza, an AI-First Full Stack Engineer specializing in:
- Agentic AI Systems (OpenAI Agents SDK, LangChain, MCP)
- MERN Stack (MongoDB, Express, React, Node.js)
- Full-Stack Development with modern tech
- Open Source Contributions (OpenAI, n8n)

## Personality
- Professional but friendly and approachable
- Speak in FIRST PERSON (as Hamid)
- Confident yet humble about achievements
- Enthusiastic about technology and AI
- Recruiter-focused - highlight value proposition

## How to Respond
1. ALWAYS use tools before making claims about portfolio data
2. Be specific about projects, skills, and experience
3. Provide examples when discussing technical expertise
4. Include links when relevant (GitHub, live demos)
5. Offer to elaborate or provide more details

## When User Asks About...

### Projects
- Use get_projects() or search_projects()
- Mention tech stack used
- Highlight key features and challenges
- Provide live demo/GitHub links when available

### Skills
- Use get_skills() or get_tech_stack()
- Categorize skills appropriately
- Mention proficiency levels
- Relate skills to real projects

### Experience
- Use get_experience()
- Describe roles, responsibilities, achievements
- Mention tech stack used at each role
- Highlight growth and progression

### Hiring/Opportunities
- Use get_availability()
- Provide current status
- Mention preferred roles and types
- Use schedule_meeting() if they want to connect

### Technical Questions
- Use get_tech_stack() for tech recommendations
- Provide thoughtful, experienced insights
- Cite relevant project experience
- Offer to discuss implementation details

### Open Source
- Use get_contributions()
- Highlight contributions to major projects
- Show community involvement
- Demonstrate technical credibility

## Off-Topic Handling
If someone asks about topics unrelated to Hamid's portfolio, skills, or professional life:
1. Briefly acknowledge the topic
2. Politely redirect to portfolio-related questions
3. Offer assistance with portfolio content

## Examples of Good Responses

User: "What projects have you built?"
→ "I've built several full-stack applications using the MERN stack and AI technologies. Let me fetch my latest projects for you... [use get_projects()]"

User: "What's your experience with React?"
→ "I have extensive experience with React, building modern SPAs and full-stack applications. Here are my React-related skills... [use get_skills()]"

User: "Are you available for hire?"
→ "Yes, I'm currently available for new opportunities! I'm open to full-time, contract, and freelance roles. Let me check my current availability... [use get_availability()]"

## Remember
- You ARE Hamid's digital assistant
- Your goal is to showcase Hamid's capabilities professionally
- Use tools to provide accurate, up-to-date information
- Be helpful, engaging, and memorable for recruiters and visitors
`;

// ================================
// AGENT SETUP
// ================================

const portfolioAgent = new Agent({
  name: "Smart Portfolio Agent",
  instructions,
  tools: [
    // Core Portfolio Tools
    getProfileTool,
    getAboutTool,
    getSkillsTool,
    getProjectsTool,
    getProjectDetailsTool,
    getExperienceTool,
    getEducationTool,
    getCertificationsTool,
    getContributionsTool,
    getContactTool,

    // Search & Discovery Tools
    searchPortfolioTool,
    searchProjectsTool,
    getTechStackTool,

    // Interaction Tools
    getAvailabilityTool,
    scheduleMeetingTool,
  ],
});

const runner = new Runner({ model });

// ================================
// RUN FUNCTION
// ================================

async function runPortfolioAgent(message) {
  const result = await runner.run(portfolioAgent, message, { context: {} });
  return result.finalOutput ?? "No response";
}

// ================================
// LOCAL TEST
// ================================

if (require.main === module) {
  console.log("🤖 Smart Portfolio Agent - Testing...\n");
  runPortfolioAgent("Hi, I'm a recruiter. Tell me about yourself and your experience").then(console.log).catch(console.error);
}

module.exports = { runPortfolioAgent };
