# Hostel Management System - Frontend

A modern, responsive React frontend for the Hostel Management System built with Vite, React 18, and Tailwind CSS.

## Features

- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS
- 🔐 **Authentication** - Secure login with Supabase Auth
- 👨‍🎓 **Student Dashboard** - Apply for leave and view leave history
- 🛡️ **Warden Dashboard** - Review and approve/reject leave requests
- 🎫 **Gate Pass Verification** - Verify and manage student gate passes
- ⚡ **Fast** - Built with Vite for lightning-fast development

## Tech Stack

- **React 18.3.1** - Latest stable version
- **Vite 5.4.2** - Next-generation frontend tooling
- **React Router 6** - Client-side routing
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **Lucide React** - Beautiful icon library
- **Supabase JS** - Authentication client

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend server running on port 5000
- Supabase project configured

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the frontend directory:
```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_API_URL=http://localhost:5000
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   │   └── Layout.jsx   # Main layout with navigation
│   ├── context/         # React context providers
│   │   └── AuthContext.jsx  # Authentication state
│   ├── lib/             # Utility libraries
│   │   ├── api.js       # API service layer
│   │   └── supabase.js  # Supabase client
│   ├── pages/           # Page components
│   │   ├── Login.jsx
│   │   ├── StudentDashboard.jsx
│   │   ├── WardenDashboard.jsx
│   │   └── GatePassVerification.jsx
│   ├── App.jsx          # Main app component with routing
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## User Roles

### Student
- Apply for leave requests
- View own leave history
- View gate pass (if approved)

### Warden
- View all pending leave requests
- Approve or reject leave requests
- Verify and mark gate passes as used

## API Integration

The frontend communicates with the backend API through the service layer in `src/lib/api.js`. All API calls include authentication tokens automatically.

## Styling

The project uses Tailwind CSS with custom utility classes defined in `src/index.css`:
- `.btn-primary` - Primary button style
- `.btn-secondary` - Secondary button style
- `.card` - Card container style
- `.input-field` - Form input style
- `.label` - Form label style

## Development

- Hot module replacement (HMR) is enabled
- ESLint is configured for code quality
- The app proxies API requests to `http://localhost:5000` during development

## License

MIT

