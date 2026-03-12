import { TemplateConfig } from "@/types/template";

export const edulearnConfig: TemplateConfig = {
  id: "edulearn",
  name: "EduLearn LMS",
  description: "Complete online education platform with courses, workshops, and community",
  category: "education",
  industries: ["education", "training", "e-learning"],
  
  // Multi-tenant settings
  features: {
    courses: true,
    workshops: true,
    community: true,
    store: true,
    certificates: true,
    challenges: true,
    progressTracking: true,
    mentorProfiles: true,
  },
  
  // Theme customization for webstudio
  theme: {
    colors: {
      primary: "#1a1a1a",
      secondary: "#f5f5f5",
      accent: "#ef4444",
      success: "#22c55e",
      warning: "#f59e0b",
      info: "#3b82f6",
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
    },
    borderRadius: "0.75rem",
  },
  
  // Navigation structure
  navigation: {
    sidebar: [
      { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
      { label: "Browse", href: "/browse", icon: "Search" },
      { label: "My Courses", href: "/courses", icon: "BookOpen" },
      { label: "Programs", href: "/programs", icon: "GraduationCap" },
      { label: "Workshops", href: "/workshops", icon: "Video" },
      { label: "Calendar", href: "/calendar", icon: "Calendar" },
      { label: "Community", href: "/forum", icon: "MessageSquare" },
      { label: "Challenges", href: "/challenges", icon: "Trophy" },
      { label: "Mentors", href: "/mentors", icon: "Users" },
      { label: "Students", href: "/students", icon: "Users" },
      { label: "Store", href: "/store", icon: "ShoppingBag" },
    ],
    resources: [
      { label: "Materials", href: "/materials", icon: "FileText" },
      { label: "Assets", href: "/assets", icon: "Package" },
      { label: "Favorites", href: "/favorites", icon: "Heart" },
      { label: "Downloads", href: "/downloads", icon: "Download" },
    ],
  },
  
  // Webstudio editable regions
  editableRegions: [
    "hero.title",
    "hero.description",
    "hero.cta",
    "sidebar.logo",
    "footer.links",
    "theme.colors",
    "theme.fonts",
  ],
  
  // Database tables required
  database: {
    tables: [
      "users",
      "courses",
      "lessons",
      "enrollments",
      "programs",
      "workshops",
      "forum_topics",
      "forum_posts",
      "challenges",
      "submissions",
      "mentors",
      "certificates",
    ],
  },
};
