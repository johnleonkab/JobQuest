# JobQuest 🎯

**Comprehensive career management platform with gamification, personalized CV building, and job offer tracking.**

## 📋 Table of Contents

- [Overview](#overview)
- [Objective](#objective)
- [Key Features](#key-features)
- [Modules](#modules)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [Security](#security)
- [Development](#development)

---

## 🎯 Overview

JobQuest is a modern web platform designed to help professionals manage their careers comprehensively. It combines practical CV management and job offer tracking tools with gamification elements that motivate and reward user progress.

---

## 🎯 Objective

The main objective of JobQuest is to provide a complete solution for job-seeking professionals, enabling them to:

1. **Build personalized CVs** tailored to each job offer
2. **Manage job offers** in an organized way with a Kanban system
3. **Get AI insights** about their CV and suggested improvements
4. **Stay motivated** through a gamification system with XP, levels, and badges
5. **Track progress** of their applications with interviews, contacts, and notes

---

## ✨ Key Features

### 🎮 Gamification
- Experience points (XP) system for actions performed
- Progressive levels with rewards
- Badge system with over 50 different achievements
- Real-time progress notifications
- Dashboard with gamification statistics

### 📝 CV Builder
- Multiple sections: Experience, Education, Certifications, Languages, Volunteering, Projects
- Intuitive editing with modals
- Automatic text improvement with AI
- CV analysis with AI insights
- Interactive chat with AI for CV queries
- Customized PDF export per offer

### 💼 Job Offer Management
- Kanban view with drag & drop
- List view with advanced filters
- Customizable statuses: Saved, Contacted, Applied, Interview, Offer, Rejected, Accepted
- Complete detail view for each offer
- CV section selection per offer
- Customized CV generation per offer
- Automatic company logo extraction
- Interview management with calendar
- Contact management per offer

### 🤖 Artificial Intelligence
- Complete CV analysis with Gemini AI
- Improvement recommendations per section
- Interactive chat about the CV
- Automatic CV section suggestions for offers
- Text improvement with spelling correction and suggestions

### 📊 Dashboard
- Overview of progress
- Current level and points
- Upcoming badges
- This week's interviews
- Pending job offers to apply
- Contacts to review
- Important notes

---

## 🧩 Modules

### 1. Authentication and Profile Module (`/profile`)
- Google OAuth authentication via Supabase
- User profile management
- Initial onboarding
- Custom avatar
- Personal and professional information

**Main files:**
- `src/app/(protected)/profile/page.tsx`
- `src/app/api/profile/route.ts`
- `src/app/api/user/route.ts`
- `src/components/OnboardingModal.tsx`

### 2. Gamification Module (`/gamification`)
- XP and levels system
- Badge system
- Events and rewards
- Progress and statistics

**Main files:**
- `src/app/(protected)/gamification/page.tsx`
- `src/app/api/gamification/route.ts`
- `src/config/gamification/`
- `src/hooks/useGamification.ts`
- `supabase_gamification.sql`

**Main events:**
- `profile.updated` - Profile update
- `cv.*` - CV events (add, update sections)
- `job_offer.*` - Job offer events
- `ai.*` - AI usage events
- And many more...

### 3. CV Builder Module (`/cv-builder`)
- Management of all CV sections
- Editing modals per section
- AI improvement per section
- CV preview

**Main files:**
- `src/app/(protected)/cv-builder/page.tsx`
- `src/components/cv/` (all section components)
- `src/app/api/cv/*/route.ts` (endpoints per section)
- `supabase_cv_builder.sql`

**Sections:**
- Work Experience
- Education
- Certifications
- Languages
- Volunteering
- Projects

### 4. Job Offers Module (`/job-openings`)
- Kanban view with drag & drop
- List view with filters
- Create/edit modal
- Detailed offer view
- Interview management
- Contact management
- CV section selection
- Customized CV generation

**Main files:**
- `src/app/(protected)/job-openings/page.tsx`
- `src/components/job-offers/`
- `src/app/api/job-offers/route.ts`
- `src/app/api/interviews/route.ts`
- `src/app/api/contacts/route.ts`
- `supabase_job_offers.sql`
- `supabase_interviews.sql`
- `supabase_job_offer_contacts.sql`

### 5. AI Module (`/cv-builder` - AI Insights)
- Complete CV analysis
- Interactive chat
- Text improvement per section
- Automatic suggestions

**Main files:**
- `src/components/cv/AIInsightsModal.tsx`
- `src/hooks/useAIInsights.ts`
- `src/hooks/useAISectionImprover.ts`
- `src/lib/ai/gemini.ts`
- `src/config/ai/prompts.ts`
- `src/app/api/ai/insights/route.ts`
- `supabase_ai_insights.sql`

### 6. Dashboard Module (`/dashboard`)
- Overview of status
- Gamification statistics
- Pending offers
- Upcoming interviews
- Contacts to review
- Important notes

**Main files:**
- `src/app/(protected)/dashboard/page.tsx`
- `src/app/api/dashboard/route.ts`

### 7. Logo Extraction Module (`/job-openings`)
- Automatic company logo extraction
- Integration with logo.dev API
- Fallback to company website

**Main files:**
- `src/lib/logo-extraction.ts`
- `src/app/api/logo-extraction/route.ts`

---

## 🛠 Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Static typing
- **Tailwind CSS** - Utility-first styling
- **React Hooks** - State management
- **Material Symbols** - Iconography

### Backend
- **Next.js API Routes** - Server endpoints
- **Supabase** - Backend as a service
  - PostgreSQL - Database
  - Row Level Security (RLS) - Row-level security
  - Storage - File storage (avatars)
  - Auth - OAuth authentication

### Database
- **PostgreSQL** (via Supabase)
- **Triggers and Functions** - Business logic in DB
- **RLS Policies** - Row-level security

### External Services
- **Google Gemini AI** - CV analysis and improvement
- **Logo.dev API** - Company logo extraction
- **Upstash Redis** - Rate limiting and cache

### Development Tools
- **Docker & Docker Compose** - Containerization
- **ESLint** - Code linting
- **Turbopack** - Fast bundler

### Security
- **CSRF Protection** - CSRF attack protection
- **Rate Limiting** - Request limiting
- **Input Validation** - Input validation
- **XSS Protection** - Sanitization with DOMPurify
- **UUID Validation** - ID validation
- **Error Handling** - Secure error handling

---

## 🏗 Architecture

### Folder Structure

```
JobQuest/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (protected)/              # Protected routes
│   │   │   ├── dashboard/           # Main dashboard
│   │   │   ├── profile/             # User profile
│   │   │   ├── cv-builder/          # CV builder
│   │   │   ├── job-openings/        # Job offers
│   │   │   ├── gamification/        # Gamification
│   │   │   └── layout.tsx           # Protected layout
│   │   ├── api/                     # API Routes
│   │   │   ├── user/                # User
│   │   │   ├── profile/             # Profile
│   │   │   ├── gamification/        # Gamification
│   │   │   ├── cv/                  # CV (all sections)
│   │   │   ├── job-offers/          # Offers
│   │   │   ├── interviews/          # Interviews
│   │   │   ├── contacts/            # Contacts
│   │   │   ├── ai/                  # AI
│   │   │   ├── logo-extraction/     # Logos
│   │   │   └── dashboard/           # Dashboard
│   │   ├── auth/                    # Authentication
│   │   └── layout.tsx               # Root layout
│   ├── components/                  # React components
│   │   ├── cv/                      # CV components
│   │   ├── job-offers/              # Job offer components
│   │   ├── Sidebar.tsx              # Sidebar
│   │   ├── OnboardingModal.tsx      # Onboarding modal
│   │   └── CSRFProvider.tsx         # CSRF provider
│   ├── contexts/                    # React contexts
│   │   └── ToastContext.tsx         # Notification system
│   ├── hooks/                       # Custom Hooks
│   │   ├── useGamification.ts       # Gamification hook
│   │   ├── useAIInsights.ts         # AI insights hook
│   │   └── useAISectionImprover.ts  # AI improvement hook
│   ├── lib/                         # Utilities and services
│   │   ├── supabase/                # Supabase client
│   │   ├── ai/                      # AI service
│   │   ├── auth/                    # Authentication actions
│   │   ├── logo-extraction.ts       # Logo extraction
│   │   └── utils/                   # Utilities
│   │       ├── csrf.ts              # CSRF
│   │       ├── rate-limit.ts        # Rate limiting
│   │       ├── error-handler.ts     # Error handling
│   │       ├── uuid-validator.ts    # UUID validation
│   │       ├── input-validator.ts   # Input validation
│   │       └── request-validator.ts # Request validation
│   ├── config/                      # Configurations
│   │   ├── gamification/            # Gamification config
│   │   └── ai/                      # AI prompts
│   ├── middleware.ts                # Next.js middleware
│   └── middleware/                  # Custom middlewares
│       ├── csrf.ts                  # CSRF middleware
│       └── rate-limit.ts            # Rate limit middleware
├── supabase_*.sql                   # Supabase SQL scripts
├── docker-compose.yml                # Docker Compose
├── Dockerfile                        # Dockerfile
├── package.json                      # Dependencies
└── README.md                         # This file
```

### Authentication Flow

1. User signs in with Google OAuth
2. Supabase handles authentication
3. Middleware verifies session on each request
4. Protected routes require authentication
5. API routes validate user with Supabase

### Data Flow

```
Client (React)
    ↓
Next.js API Routes
    ↓
Supabase Client (Server)
    ↓
PostgreSQL (with RLS)
```

### Security

1. **Middleware Layer**
   - CSRF protection
   - Rate limiting
   - Session validation

2. **API Layer**
   - Authentication checks
   - Input validation
   - UUID validation
   - Ownership validation
   - Error sanitization

3. **Database Layer**
   - Row Level Security (RLS)
   - Policies per table
   - Triggers for business logic

---

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

# Logo.dev
LOGO_DEV_API_KEY=your_logo_dev_api_key

# Upstash Redis (for rate limiting)
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```

See `CONFIGURACION_VARIABLES_ENTORNO.md` for more details.

### Database

Execute the following SQL scripts in Supabase (in order):

1. `supabase_setup.sql` - Initial setup
2. `supabase_gamification.sql` - Gamification module
3. `supabase_cv_builder.sql` - CV builder
4. `supabase_job_offers.sql` - Job offers
5. `supabase_interviews.sql` - Interviews
6. `supabase_job_offer_contacts.sql` - Contacts
7. `supabase_ai_insights.sql` - AI insights
8. `supabase_job_offers_website_migration.sql` - Website migration

### Installation

```bash
# Install dependencies
npm install

# Run in development
npm run dev

# Build for production
npm run build

# Run in production
npm start

# Linting
npm run lint
```

### Docker

```bash
# Build image
docker-compose build

# Run container
docker-compose up

# Run in background
docker-compose up -d
```

---

## 🔒 Security

### Implemented Measures

1. **CSRF Protection**
   - CSRF tokens in cookies
   - Validation in middleware
   - Required headers for mutations

2. **Rate Limiting**
   - Upstash Redis for rate limiting
   - Limits per endpoint type
   - Memory fallback in development

3. **Input Validation**
   - Type validation
   - Length validation
   - UUID validation
   - URL and email validation
   - Enum validation

4. **XSS Protection**
   - DOMPurify for sanitization
   - HTML validation before rendering

5. **Error Handling**
   - Generic messages in production
   - Secure logging
   - No exposure of sensitive information

6. **Row Level Security (RLS)**
   - Policies per table
   - Users only access their data
   - Ownership validation in API

7. **File Upload Security**
   - MIME type validation
   - Size validation
   - Random file names

---

## 🚀 Development

### Component Structure

Components follow a modular structure:

- **Pages**: `src/app/(protected)/*/page.tsx`
- **Components**: `src/components/*/`
- **Hooks**: `src/hooks/*.ts`
- **API Routes**: `src/app/api/*/route.ts`

### Adding a New CV Section

1. Create table in Supabase
2. Create API route in `src/app/api/cv/[section]/route.ts`
3. Create component in `src/components/cv/[Section]Section.tsx`
4. Create modal in `src/components/cv/[Section]Modal.tsx`
5. Add to `src/app/(protected)/cv-builder/page.tsx`
6. Add gamification events

### Adding a New Gamification Event

1. Add event in `src/config/gamification/events.ts`
2. Add XP reward
3. Call `recordEvent` in the appropriate place

### Testing

- **Rate Limiting**: `/test-rate-limit`
- **Toasts**: `/test-toasts`

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Gemini AI Documentation](https://ai.google.dev/docs)
- [Upstash Documentation](https://docs.upstash.com/)

---

## 📝 License

This project is private and for personal use.

---

## 👤 Author

Developed as a personal project for career management.

---

**Last updated**: December 2024
