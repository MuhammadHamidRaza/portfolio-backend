// Seed Script - Populates initial portfolio data
require("dotenv").config();
const { sql } = require("./db");

const seedData = async () => {
  try {
    console.log("Starting seed...");

    // 1. Seed HOME
    console.log("Seeding Home...");
    await sql`
      INSERT INTO home (
        greeting, name, tagline, typed_roles, bio,
        profile_image, cv_link, github_link, linkedin_link, email, phone,
        meta_title, meta_description, meta_keywords
      ) VALUES (
        'Hello, I''m',
        'Muhammad Hamid Raza',
        'I build AI-powered systems where agents don''t just chat — they reason, act, and automate.',
        '["Agentic AI Engineer", "Full-Stack Developer", "AI Systems Architect", "Backend Engineer"]',
        'I am an Agentic AI and Full-Stack Engineer focused on building intelligent, autonomous, and production-grade systems. I design AI-driven platforms where agents can reason, coordinate, call tools, manage memory, automate workflows, and interact with real-world systems.',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
        'https://docs.google.com/document/d/your-cv-link',
        'https://github.com/muhammadhamidraza',
        'https://linkedin.com/in/hamid-raza-b249162a8',
        'muhammadhamidr92@gmail.com',
        '+92 316 0010801',
        'Muhammad Hamid Raza - Agentic AI Engineer & Full-Stack Developer',
        'Portfolio of Muhammad Hamid Raza - Agentic AI Engineer and Full-Stack Developer specializing in AI-powered systems, MERN stack, React.js, and intelligent automation.',
        'AI Engineer, Agentic AI, MERN Developer, Full-Stack, OpenAI Agent SDK, MCP, AI Automation, Portfolio'
      )
      ON CONFLICT DO NOTHING
    `;

    // 2. Seed ABOUT
    console.log("Seeding About...");
    await sql`
      INSERT INTO about (
        title, subtitle, bio_text, bio_text_2, values, background_image,
        meta_title, meta_description, meta_keywords
      ) VALUES (
        'About Me',
        'Get to know more about me, my background, and what drives me as an AI Engineer.',
        'I am an Agentic AI and Full-Stack Engineer focused on building intelligent, autonomous, and production-grade systems. I do NOT build simple CRUD apps only. I design AI-driven platforms where agents can reason, coordinate, call tools, manage memory, automate workflows, and interact with real-world systems.',
        'My work sits at the intersection of AI agents, backend systems, scalable APIs, and modern frontend experiences. I am passionate about creating systems where AI agents don''t just chat — they reason, act, and automate complex business processes.',
        '[{"icon":"fas fa-robot","title":"Agentic AI","description":"I build autonomous AI agents that can reason, make decisions, and execute complex tasks.","color":"primary"},{"icon":"fas fa-brain","title":"AI Systems","description":"I design production-ready AI architectures with memory, tool calling, and orchestration.","color":"secondary"},{"icon":"fas fa-code","title":"Full-Stack","description":"I build scalable MERN stack applications with modern frontend experiences.","color":"accent"},{"icon":"fas fa-bolt","title":"Automation","description":"I create intelligent automation workflows that save time and reduce manual effort.","color":"primary"}]',
        'https://images.unsplash.com/photo-1677442136019-21780ecad995',
        'About Me | Muhammad Hamid Raza',
        'Learn more about Muhammad Hamid Raza, an Agentic AI Engineer and Full-Stack Developer building intelligent, autonomous systems.',
        'About, AI Engineer, Agentic AI, Full-Stack Developer, MERN, AI Systems'
      )
      ON CONFLICT DO NOTHING
    `;

    // 3. Seed SKILLS (aligned with identity.md)
    console.log("Seeding Skills...");
    const skills = [
      // Agentic AI & AI Systems
      { name: "OpenAI Agent SDK", category: "Agentic AI & AI Systems", level: "92%", description: "Building AI agents with tool calling, memory, and orchestration", icon: "fas fa-robot", color: "primary" },
      { name: "Model Context Protocol", category: "Agentic AI & AI Systems", level: "88%", description: "MCP architecture and multi-agent communication", icon: "fas fa-network-wired", color: "secondary" },
      { name: "Prompt Engineering", category: "Agentic AI & AI Systems", level: "90%", description: "Few-shot prompting, structured outputs, and role prompting", icon: "fas fa-comments", color: "accent" },
      { name: "Multi-Agent Systems", category: "Agentic AI & AI Systems", level: "85%", description: "Agent orchestration and coordination patterns", icon: "fas fa-users", color: "primary" },
      { name: "Agent Memory Design", category: "Agentic AI & AI Systems", level: "82%", description: "Short-term and long-term memory for AI agents", icon: "fas fa-memory", color: "secondary" },
      // Backend Engineering
      { name: "Node.js", category: "Backend Engineering", level: "90%", description: "Server-side JavaScript runtime", icon: "fab fa-node-js", color: "primary" },
      { name: "Express.js", category: "Backend Engineering", level: "88%", description: "Web framework for Node.js", icon: "fas fa-server", color: "secondary" },
      { name: "PostgreSQL", category: "Backend Engineering", level: "85%", description: "Relational database with Neon", icon: "fas fa-database", color: "accent" },
      { name: "MongoDB", category: "Backend Engineering", level: "88%", description: "NoSQL database", icon: "fas fa-leaf", color: "primary" },
      { name: "RESTful APIs", category: "Backend Engineering", level: "95%", description: "API design and implementation", icon: "fas fa-plug", color: "secondary" },
      { name: "Socket.io", category: "Backend Engineering", level: "85%", description: "Real-time communication", icon: "fas fa-bolt", color: "accent" },
      // Frontend Engineering
      { name: "React.js", category: "Frontend Engineering", level: "95%", description: "Frontend library", icon: "fab fa-react", color: "primary" },
      { name: "Next.js", category: "Frontend Engineering", level: "90%", description: "React framework with SSR", icon: "fas fa-fast-forward", color: "secondary" },
      { name: "Vite", category: "Frontend Engineering", level: "92%", description: "Next-gen frontend tooling", icon: "fas fa-bolt", color: "accent" },
      { name: "Tailwind CSS", category: "Frontend Engineering", level: "95%", description: "Utility-first CSS framework", icon: "fab fa-css3", color: "primary" },
      { name: "Framer Motion", category: "Frontend Engineering", level: "88%", description: "Animation library for React", icon: "fas fa-film", color: "secondary" },
      { name: "GSAP", category: "Frontend Engineering", level: "80%", description: "Professional animation library", icon: "fas fa-play", color: "accent" },
      // Tools & DevOps
      { name: "Git", category: "Tools & DevOps", level: "92%", description: "Version control and collaboration", icon: "fab fa-git-alt", color: "primary" },
      { name: "AWS", category: "Tools & DevOps", level: "82%", description: "Cloud services", icon: "fab fa-aws", color: "secondary" },
      { name: "Firebase", category: "Tools & DevOps", level: "88%", description: "Backend-as-a-Service", icon: "fab fa-google", color: "accent" },
      { name: "n8n", category: "Tools & DevOps", level: "85%", description: "Workflow automation", icon: "fas fa-project-diagram", color: "primary" },
      { name: "Drizzle ORM", category: "Tools & DevOps", level: "80%", description: "Type-safe ORM for PostgreSQL", icon: "fas fa-database", color: "secondary" },
    ];

    for (const skill of skills) {
      await sql`
        INSERT INTO skills (name, category, level, description, icon, color, meta_title, meta_description, meta_keywords)
        VALUES (${skill.name}, ${skill.category}, ${skill.level}, ${skill.description}, ${skill.icon}, ${skill.color}, 'Skills | Muhammad Hamid Raza', 'Technical skills and expertise of Muhammad Hamid Raza - ' || ${skill.category}, 'skills, programming, development, ' || LOWER(${skill.category}))
        ON CONFLICT DO NOTHING
      `;
    }

    // 4. Seed PROJECTS
    console.log("Seeding Projects...");
    const projects = [
      {
        title: "AI Agent Platform",
        description: "A production-grade AI agent platform where autonomous agents can reason, call tools, manage memory, and execute complex business workflows with human oversight.",
        technologies: ["React.js", "Next.js", "Node.js", "Express", "OpenAI Agent SDK", "PostgreSQL"],
        category: "AI Platform",
        live_demo: "https://demo-ai-platform.com",
        featured: true,
        color: "primary"
      },
      {
        title: "IPTV Dashboard",
        description: "An IPTV admin panel to manage users, billing, live stream status, and analytics with a responsive UI.",
        technologies: ["React.js", "Vite", "Node.js", "MongoDB", "Tailwind CSS"],
        category: "Admin Panel",
        live_demo: "https://frontend.dashcore.eu/",
        featured: true,
        color: "secondary"
      },
      {
        title: "Real Estate Platform",
        description: "A fully responsive platform to browse, search, and filter properties with agent contact and lead generation features.",
        technologies: ["React.js", "Vite", "Firebase", "Tailwind CSS"],
        category: "Web Application",
        live_demo: "https://buyhomeforless.com/",
        featured: false,
        color: "accent"
      },
      {
        title: "Automation Workflow Engine",
        description: "An intelligent workflow automation engine powered by AI agents that can process documents, send notifications, and orchestrate business logic.",
        technologies: ["React.js", "Node.js", "n8n", "PostgreSQL", "Socket.io"],
        category: "AI Automation",
        live_demo: "https://automation.demo.com",
        featured: true,
        color: "primary"
      },
      {
        title: "HR CRM System",
        description: "A CRM system for managing job applicants, employee records, interviews, and HR pipelines with role-based access.",
        technologies: ["React.js", "Vite", "Express.js", "MongoDB", "Tailwind CSS"],
        category: "Enterprise",
        live_demo: "https://transferweb.tech/",
        featured: false,
        color: "secondary"
      },
      {
        title: "AI Chat Assistant",
        description: "An intelligent chat assistant powered by OpenAI Agent SDK that can perform tasks, search knowledge bases, and automate workflows.",
        technologies: ["React.js", "Node.js", "OpenAI Agent SDK", "PostgreSQL"],
        category: "AI Application",
        live_demo: "https://chat.demo.com",
        featured: false,
        color: "accent"
      },
    ];

    for (const project of projects) {
      const metaDesc = 'Project: ' + project.title + ' - ' + project.description.substring(0, 100);
      await sql`
        INSERT INTO projects (title, description, technologies, category, live_demo, github_link, featured, color, meta_title, meta_description, meta_keywords)
        VALUES (${project.title}, ${project.description}, ${JSON.stringify(project.technologies)}, ${project.category}, ${project.live_demo}, null, ${project.featured}, ${project.color}, 'Projects | Muhammad Hamid Raza', ${metaDesc}, 'portfolio, projects, ' || LOWER(${project.category}))
        ON CONFLICT DO NOTHING
      `;
    }

    // 5. Seed CONTRIBUTIONS (from identity.md)
    console.log("Seeding Contributions...");
    const contributions = [
      {
        title: "OpenAI Agent SDK Documentation",
        description: "Contributed to improving exception handling docs, clarified tool behavior, and added external security documentation references for the openai-agents-python library.",
        project_name: "openai-agents-python",
        issuer: "OpenAI",
        type: "Documentation",
        link: "https://github.com/openai/openai-agents-python"
      },
      {
        title: "n8n Documentation Enhancement",
        description: "Improved node settings clarity and enhanced navigation for better developer understanding in the n8n workflow automation platform.",
        project_name: "n8n",
        issuer: "n8n",
        type: "Documentation",
        link: "https://github.com/n8n-io/n8n-docs"
      },
      {
        title: "Community AI Tooling",
        description: "Built and open-sourced several AI automation tools and utilities for the developer community.",
        project_name: "AI-Tools",
        issuer: "GitHub",
        type: "Code",
        link: "https://github.com/muhammadhamidraza"
      },
    ];

    for (const contrib of contributions) {
      await sql`
        INSERT INTO contributions (title, description, project_name, issuer, type, link, meta_title, meta_description, meta_keywords)
        VALUES (${contrib.title}, ${contrib.description}, ${contrib.project_name}, ${contrib.issuer}, ${contrib.type}, ${contrib.link}, 'Contributions | Muhammad Hamid Raza', 'Open source contributions by Muhammad Hamid Raza to AI and developer tools.', 'open source, contributions, AI, documentation')
        ON CONFLICT DO NOTHING
      `;
    }

    // 6. Seed EXPERIENCE
    console.log("Seeding Experience...");
    const experience = [
      {
        company: "SID Techno",
        role: "Agentic AI & Full-Stack Developer",
        duration: "Mar 2024 - Present",
        description: "Building AI-powered systems where agents can reason, coordinate, call tools, manage memory, and automate complex workflows. Designing production-grade AI platforms using OpenAI Agent SDK, Model Context Protocol, and modern MERN stack. Creating intelligent automation solutions for enterprise clients.",
        tech_stack: ["React.js", "Next.js", "Node.js", "Express", "PostgreSQL", "OpenAI Agent SDK", "MCP", "Tailwind CSS", "Socket.io"],
        icon: "fas fa-robot",
        color: "primary"
      },
      {
        company: "SID Techno",
        role: "MERN Stack Developer",
        duration: "Dec 2023 - Feb 2024",
        description: "Worked on diverse projects, gaining hands-on experience in front-end and back-end development. Contributed to building responsive, user-friendly web applications using JavaScript, HTML, CSS, and modern frameworks. Learned foundational skills in Node.js and React.js.",
        tech_stack: ["JavaScript", "HTML/CSS", "Node.js", "React.js", "Responsive Design", "MongoDB"],
        icon: "fas fa-code",
        color: "secondary"
      },
    ];

    for (const exp of experience) {
      const metaDesc = 'Work experience at ' + exp.company + ' as ' + exp.role;
      await sql`
        INSERT INTO experience (company, role, duration, description, tech_stack, icon, color, meta_title, meta_description, meta_keywords)
        VALUES (${exp.company}, ${exp.role}, ${exp.duration}, ${exp.description}, ${JSON.stringify(exp.tech_stack)}, ${exp.icon}, ${exp.color}, 'Experience | Muhammad Hamid Raza', ${metaDesc}, 'experience, work history, employment, AI Engineer')
        ON CONFLICT DO NOTHING
      `;
    }

    // 7. Seed EDUCATION
    console.log("Seeding Education...");
    const education = [
      {
        institution: "Government College of Commerce & Economics",
        degree: "Bachelor's Degree",
        period: "In Progress",
        description: "Currently pursuing a degree with a focus on commerce, economics, and technology applications in business contexts. Combining business acumen with technical skills to build AI-powered solutions.",
        highlights_title: "Focus Areas",
        highlights: ["AI in Business", "E-commerce Solutions", "Business Analytics", "Digital Transformation"],
        icon: "fas fa-university",
        color: "primary"
      },
      {
        institution: "Government College of Commerce & Economics",
        degree: "Intermediate",
        period: "2022 - 2024",
        description: "Completed intermediate education with a focus on commerce and computer science. Built foundational skills in programming and business fundamentals.",
        highlights_title: "Key Subjects",
        highlights: ["Commerce", "Computer Science", "Economics", "Mathematics"],
        icon: "fas fa-graduation-cap",
        color: "secondary"
      },
      {
        institution: "Saylani Mass IT Training",
        degree: "Full Stack Web Development",
        period: "2022 - 2023",
        description: "Completed a comprehensive full stack web development course, gaining expertise in HTML, CSS, JavaScript, React.js, Node.js, and database management. Started my journey into AI and automation later.",
        highlights_title: "Key Learnings",
        highlights: ["HTML, CSS, JavaScript", "React.js & Node.js", "MongoDB & Databases", "Web Development Fundamentals"],
        icon: "fas fa-laptop-code",
        color: "accent"
      },
    ];

    for (const edu of education) {
      const metaDesc = 'Education background of Muhammad Hamid Raza - ' + edu.degree + ' at ' + edu.institution;
      await sql`
        INSERT INTO education (institution, degree, period, description, highlights_title, highlights, icon, color, meta_title, meta_description, meta_keywords)
        VALUES (${edu.institution}, ${edu.degree}, ${edu.period}, ${edu.description}, ${edu.highlights_title}, ${JSON.stringify(edu.highlights)}, ${edu.icon}, ${edu.color}, 'Education | Muhammad Hamid Raza', ${metaDesc}, 'education, degree, certification, learning')
        ON CONFLICT DO NOTHING
      `;
    }

    // 8. Seed CERTIFICATIONS
    console.log("Seeding Certifications...");
    const certifications = [
      { title: "OpenAI Agent SDK Fundamentals", issuer: "OpenAI", color: "primary" },
      { title: "React.js Advanced Development", issuer: "Udemy", color: "secondary" },
      { title: "MERN Stack Mastery", issuer: "Coursera", color: "accent" },
      { title: "Responsive Web Design", issuer: "freeCodeCamp", color: "primary" },
      { title: "Node.js Backend Development", issuer: "Udemy", color: "secondary" },
    ];

    for (const cert of certifications) {
      await sql`
        INSERT INTO certifications (title, issuer, color, certificate_image, issued_date)
        VALUES (${cert.title}, ${cert.issuer}, ${cert.color}, null, null)
        ON CONFLICT DO NOTHING
      `;
    }

    // 9. Seed CONTACT
    console.log("Seeding Contact...");
    await sql`
      INSERT INTO contact (
        contact_items, social_links, meta_title, meta_description, meta_keywords
      ) VALUES (
        '[{"icon":"fas fa-map-marker-alt","title":"Location","value":"Karachi, Pakistan","color":"primary","link":null},{"icon":"fas fa-envelope","title":"Email","value":"muhammadhamidr92@gmail.com","color":"secondary","link":"mailto:muhammadhamidr92@gmail.com"},{"icon":"fas fa-phone-alt","title":"Phone","value":"+92 316 0010801","color":"accent","link":"tel:+923160010801"},{"icon":"fas fa-globe","title":"Website","value":"https://muhammad-hamid-raza.vercel.app/","color":"primary","link":"https://muhammad-hamid-raza.vercel.app/"}]',
        '[{"icon":"fab fa-github","url":"https://github.com/muhammadhamidraza","color":"primary","hoverColor":"primary"},{"icon":"fab fa-linkedin-in","url":"https://linkedin.com/in/hamid-raza-b249162a8","color":"secondary","hoverColor":"secondary"},{"icon":"fab fa-twitter","url":"https://twitter.com/muhammadhamidraza","color":"accent","hoverColor":"accent"}]',
        'Contact | Muhammad Hamid Raza',
        'Get in touch with Muhammad Hamid Raza for AI-powered web development projects, collaborations, or inquiries.',
        'contact, email, phone, reach out, hire, AI Engineer'
      )
      ON CONFLICT DO NOTHING
    `;

    console.log("Seed completed successfully!");
  } catch (error) {
    console.error("Seed error:", error);
  }
};

// Run seed
seedData();
