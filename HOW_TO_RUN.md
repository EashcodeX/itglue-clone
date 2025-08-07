# How to Run ITGlue Clone

This guide will help you set up and run the ITGlue clone application locally.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 18.0 or higher)
- **npm** or **yarn** package manager
- **Git** for version control
- **Supabase account** (for database and authentication)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd itglue-clone
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Add your Supabase credentials to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Database Setup

The application uses Supabase for the database. The required tables will be created automatically when you first run the application.

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Detailed Setup Instructions

### Supabase Configuration

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and API keys

2. **Database Tables**
   The application requires the following tables:
   - `clients` - Client organizations
   - `organizations` - Organization details
   - `contacts` - Contact information
   - `locations` - Location data

3. **Row Level Security (RLS)**
   Enable RLS policies for multi-tenant access control.

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run type checking
npm run type-check
```

## Application Structure

```
itglue-clone/
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── organizations/   # Organization management
│   │   ├── clients/         # Client selection
│   │   └── layout.tsx       # Root layout
│   ├── components/          # Reusable components
│   │   ├── Header.tsx       # Application header
│   │   ├── Sidebar.tsx      # Navigation sidebar
│   │   └── OrganizationForm.tsx # Form components
│   ├── contexts/            # React contexts
│   │   └── ClientContext.tsx # Client state management
│   └── lib/                 # Utilities and configurations
│       └── supabase.ts      # Supabase client
├── public/                  # Static assets
├── .env.local              # Environment variables
└── package.json            # Dependencies and scripts
```

## Features

### ✅ Implemented Features

- **Client Selection Interface** - Choose which client/organization to manage
- **Organization Management** - View and edit organization details
- **Editable Forms** - Comprehensive forms for all organization data
- **Contact Management** - Add, edit, and manage contacts
- **Location Management** - Manage multiple locations (13+ locations supported)
- **Sidebar Navigation** - Functional navigation between sections
- **Responsive Design** - Works on desktop and mobile devices

### 📋 Form Sections

1. **General Information** - Organization type, industry, contact details
2. **Site Summary** - Basic site information and hours
3. **Site Summary (Legacy)** - Legacy site details and notes
4. **Client Contacts** - Contact management with roles and departments
5. **Locations** - Multiple location management with full details
6. **After Hour Access** - Access instructions and emergency contacts
7. **Client Authorization** - Security and purchasing authority settings

## Usage Guide

### 1. Client Selection

- Start at the home page
- Select a client from the grid layout
- This sets the context for all subsequent operations

### 2. Organization Management

- View organization details in read-only mode
- Click "Edit" to modify any information
- Use the sidebar to navigate between sections

### 3. Form Editing

- All fields are editable in edit mode
- Add/remove contacts and locations dynamically
- Form validation ensures data integrity
- Save changes or cancel to discard

### 4. Navigation

- Use the sidebar to navigate between sections
- Back buttons return to previous views
- Breadcrumb navigation shows current location

## Troubleshooting

### Common Issues

1. **Application won't start**
   - Check Node.js version (18.0+)
   - Verify all dependencies are installed
   - Check environment variables

2. **Database connection errors**
   - Verify Supabase credentials
   - Check network connectivity
   - Ensure Supabase project is active

3. **Navigation not working**
   - Clear browser cache
   - Check console for JavaScript errors
   - Verify all routes are properly configured

### Development Tips

- Use browser developer tools for debugging
- Check the console for error messages
- Verify environment variables are loaded correctly
- Test with different client selections

## Production Deployment

### Build Process

```bash
npm run build
npm start
```

### Environment Setup

Ensure production environment variables are configured:
- Use production Supabase project
- Enable proper RLS policies
- Configure domain settings

### Deployment Platforms

The application can be deployed to:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Docker containers**

## Support

For issues or questions:
1. Check this documentation
2. Review the application logs
3. Verify environment configuration
4. Test with sample data

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **State Management**: React Context API

---

**Note**: This application is a clone of ITGlue functionality and is intended for demonstration purposes. Ensure proper security measures are in place before using in production environments.
