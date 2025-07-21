# ServeNow - Modern SaaS Platform

A full-stack SaaS application built with Next.js 14, TypeScript, Supabase, and modern React ecosystem tools. Ready to scale and serve your customers with cutting-edge technology.

## 🚀 Features

- **Next.js 14 App Router** - Latest Next.js with App Router for optimal performance
- **TypeScript** - Full type safety throughout the application
- **Supabase** - Backend-as-a-Service with authentication and real-time database
- **shadcn/ui** - Beautiful, accessible UI components built on Radix UI
- **TailwindCSS** - Utility-first CSS framework with custom design system
- **React Query** - Powerful data fetching and state management
- **React Hook Form** - Performant forms with easy validation
- **Zod** - TypeScript-first schema validation
- **Framer Motion** - Production-ready motion library for animations
- **Lucide React** - Beautiful & consistent icon library
- **ESLint & Prettier** - Code linting and formatting
- **API Routes** - RESTful API endpoints with proper error handling
- **Environment Variables** - Secure configuration management
- **Responsive Design** - Mobile-first responsive layouts

## 📁 Project Structure

```
servenow/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── health/        # Health check endpoint
│   │   │   └── users/         # User management endpoints
│   │   ├── globals.css        # Global styles with shadcn/ui variables
│   │   ├── layout.tsx         # Root layout with React Query provider
│   │   └── page.tsx           # Home page with demo components
│   ├── components/            # Reusable components
│   │   ├── ui/               # shadcn/ui components (Button, Input, Dialog, etc.)
│   │   ├── forms/            # Form components with React Hook Form
│   │   └── modals/           # Modal components
│   ├── hooks/                # Custom React hooks (React Query)
│   ├── lib/                  # Utility functions and configurations
│   │   ├── supabase.ts       # Supabase client configuration
│   │   ├── react-query.tsx   # React Query provider setup
│   │   ├── validations.ts    # Zod schemas for form validation
│   │   └── utils.ts          # Utility functions
│   └── types/                # TypeScript type definitions
├── .env.example              # Environment variables template
├── .env.local               # Local environment variables
├── components.json           # shadcn/ui configuration
├── .eslintrc.json           # ESLint configuration
├── .prettierrc              # Prettier configuration
├── next.config.js           # Next.js configuration
├── package.json             # Dependencies and scripts
├── postcss.config.js        # PostCSS configuration
├── tailwind.config.ts       # TailwindCSS configuration with shadcn/ui
└── tsconfig.json            # TypeScript configuration
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd servenow
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your actual Supabase configuration:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## 🔌 API Endpoints

### Health Check
- `GET /api/health` - Check API status

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `GET /api/users/[id]` - Get user by ID
- `PUT /api/users/[id]` - Update user by ID
- `DELETE /api/users/[id]` - Delete user by ID

## 🎨 Styling & UI Components

This project uses **TailwindCSS** with **shadcn/ui** for styling and components:

### TailwindCSS Configuration
- Custom design system with CSS variables
- Dark mode support (class-based)
- Responsive design utilities
- Custom animations with `tailwindcss-animate`

### shadcn/ui Components
Pre-built, accessible components included:
- **Button** - Multiple variants (default, destructive, outline, secondary, ghost, link)
- **Input** - Form input with consistent styling
- **Label** - Accessible form labels
- **Dialog** - Modal dialogs with overlay and animations
- All components are customizable and follow Radix UI patterns

### Icons
- **Lucide React** - Beautiful, consistent SVG icons
- Tree-shakeable and lightweight
- Extensive icon library for all use cases

## 🔧 Configuration

### TypeScript
- Strict mode enabled
- Path aliases configured (`@/*` points to `src/*`)
- Next.js plugin included
- Full type safety with Zod schemas

### Supabase Setup
1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings > API
3. Update `.env.local` with your credentials
4. The client is configured in `src/lib/supabase.ts`

### React Query
- Configured with sensible defaults
- DevTools enabled in development
- Custom hooks for data fetching in `src/hooks/`
- Provider setup in `src/lib/react-query.tsx`

### Form Handling
- **React Hook Form** for performant forms
- **Zod** schemas for validation in `src/lib/validations.ts`
- **@hookform/resolvers** for seamless integration
- Type-safe form inputs and validation

### Animations
- **Framer Motion** for smooth animations
- Pre-configured motion components
- Performance-optimized animations
- Easy-to-use animation presets

### ESLint & Prettier
- Next.js recommended rules
- TypeScript support
- Prettier integration
- Custom rules for code quality

### Environment Variables
Required environment variables in `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# App Configuration
NODE_ENV="development"
APP_URL="http://localhost:3000"
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on every push

### Other Platforms
This Next.js application can be deployed to any platform that supports Node.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify
- Heroku

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🧪 Demo Features

The home page includes interactive demos showcasing:

1. **User Management Modal**
   - React Hook Form with Zod validation
   - shadcn/ui Dialog component
   - Framer Motion animations
   - Form error handling

2. **Contact Form**
   - Complete form validation
   - Loading states and animations
   - Responsive design
   - Type-safe form handling

3. **React Query Integration**
   - Custom hooks for data fetching
   - Optimistic updates
   - Error handling
   - DevTools for debugging

## 📚 Documentation Links

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [React Hook Form Documentation](https://react-hook-form.com)
- [Zod Documentation](https://zod.dev)
- [Framer Motion Documentation](https://www.framer.com/motion)

## 🆘 Support

If you encounter any issues or have questions:

1. Check the documentation links above
2. Review the demo components for implementation examples
3. Open an issue in this repository

---

Built with ❤️ using Next.js 14, TypeScript, Supabase, and the modern React ecosystem