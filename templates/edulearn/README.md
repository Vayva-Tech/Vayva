# EduLearn - Online Education Platform Template

A modern, light-themed Learning Management System (LMS) template inspired by the Onetica design from Dribbble.

## Design Source
**Dribbble Shot:** [Online Education Web Platform Design](https://dribbble.com/shots/26885090-Online-Education-Web-Platform-Design) by Conceptzilla

## Features

### Pages
1. **Course Player** (`/`) - Video player with lesson progress, discussion, and resources
2. **Courses Listing** (`/courses`) - Browse all courses with filters and categories
3. **Mentors** (`/mentors`) - Meet the instructors and industry experts
4. **Pricing** (`/pricing`) - Subscription plans with monthly/yearly toggle

### Design System
- **Light Theme:** Clean white and gray backgrounds
- **Accent Colors:** Red/orange for active states and CTAs
- **Sidebar Navigation:** 14 navigation items with active state highlighting
- **Components:** Cards, buttons, tabs, progress bars, discussion threads

### Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Lucide React (icons)

## File Structure
```
templates/edulearn/
├── app/
│   ├── courses/
│   │   └── page.tsx       # Course listing page
│   ├── mentors/
│   │   └── page.tsx       # Mentors directory
│   ├── pricing/
│   │   └── page.tsx       # Pricing plans
│   ├── globals.css        # Global styles & design tokens
│   ├── layout.tsx         # Root layout with sidebar
│   └── page.tsx           # Course player (homepage)
├── components/
│   ├── Header.tsx         # Top header with breadcrumb, search
│   ├── Navbar.tsx         # (Alternative nav component)
│   └── Sidebar.tsx        # Left sidebar navigation
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── tsconfig.json
```

## Design Elements Replicated

### From the Dribbble Shot:
- ✅ Light gray/white color scheme
- ✅ Left sidebar with logo "Onetica"
- ✅ Navigation items: Browse, Programs, Courses (active), My Favorites, Calendar, Forum, Mentors, Students, Challenges, Workshops, Materials, Assets library, Downloads, Store
- ✅ Top header with breadcrumb, search bar, "Upgrade to PRO" button
- ✅ User profile icons and notification/settings buttons
- ✅ Video player section with controls
- ✅ Course info with instructor details
- ✅ Tab navigation: Overview, Notes, Transcript, Q&A, Discussion (active with badge)
- ✅ Discussion section with comment input and threaded comments
- ✅ Right sidebar with lesson progress ("7 of 16 lessons completed")
- ✅ Lesson list with completion states (checkmarks, locks)
- ✅ Lesson resources section with downloadable files
- ✅ Related/up next content section

## Getting Started

1. Install dependencies:
```bash
cd templates/edulearn
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## Key Design Decisions

1. **Course Player as Homepage** - The main interaction is watching courses
2. **Fixed Sidebar** - Always visible for quick navigation
3. **Breadcrumb Navigation** - Shows context within course hierarchy
4. **Progress Visualization** - Clear visual feedback on learning progress
5. **Discussion Integration** - Community learning directly in the player

## Customization

### Colors
Edit `globals.css` CSS variables:
```css
--accent-red: #ef4444;
--accent-orange: #f97316;
--bg-primary: #f8f9fa;
```

### Sidebar Items
Edit `components/Sidebar.tsx` to modify navigation items.

### Course Content
Edit `app/page.tsx` to change the course being displayed.

## License
Free to use for personal and commercial projects. Attribution to the original Dribbble designer (Conceptzilla) is appreciated.
