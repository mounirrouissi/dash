# Event Dashboard

A modern, responsive event management dashboard built with React, TypeScript, and Vite. Features a collapsible sidebar, internationalization support, and a clean UI built with Tailwind CSS and Radix UI components.

## Features

- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- 🌐 **Internationalization** - Multi-language support (English/French) with react-i18next
- 🎨 **Modern UI** - Built with Tailwind CSS and Radix UI components
- 📊 **Dashboard** - Overview with analytics and event management
- 🧾 **Invoice Management** - Create and manage invoices
- 🔄 **Collapsible Sidebar** - Adaptive sidebar that responds to screen size
- ⚡ **Fast Development** - Powered by Vite with Hot Module Replacement (HMR)
- 🔧 **TypeScript** - Full type safety and better developer experience

## Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js**: Version 18.0.0 or higher (recommended: 20.x LTS)
- **npm**: Version 9.0.0 or higher (comes with Node.js)

You can check your versions by running:

```bash
node --version
npm --version
```

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd my-event-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

## Development

To start the development server:

```bash
npm run dev
```

This will start the Vite development server, typically at `http://localhost:5173`. The page will automatically reload when you make changes.

## Available Scripts

- **`npm run dev`** - Start the development server
- **`npm run build`** - Build the project for production
- **`npm run preview`** - Preview the production build locally
- **`npm run lint`** - Run ESLint to check for code issues

## Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory, ready to be deployed to any static hosting service.

To preview the production build locally:

```bash
npm run preview
```

## Technology Stack

### Core

- **React** 19.1.0 - UI library
- **TypeScript** 5.8.3 - Type safety
- **Vite** 7.0.0 - Build tool and dev server

### UI & Styling

- **Tailwind CSS** 3.4.17 - Utility-first CSS framework
- **Radix UI** - Accessible, unstyled UI components
- **Lucide React** - Beautiful icons
- **tailwindcss-animate** - Animation utilities

### Routing & State

- **React Router DOM** 7.6.3 - Client-side routing
- **react-i18next** 15.5.3 - Internationalization

### Development Tools

- **ESLint** 9.29.0 - Code linting
- **TypeScript ESLint** 8.34.1 - TypeScript-specific linting rules
- **Autoprefixer** 10.4.21 - CSS vendor prefixing

## Project Structure

```
src/
├── components/
│   └── ui/           # Reusable UI components (sidebar, etc.)
├── pages/
│   ├── Dashboard.tsx # Main dashboard page
│   └── Invoices.tsx  # Invoice management page
├── App.tsx           # Main application component
└── main.tsx          # Application entry point
```

## Browser Support

This project supports all modern browsers:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

### Common Issues

**Node.js version issues:**

- Make sure you're using Node.js 18+
- Consider using [nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions

**Port already in use:**

- The dev server will automatically try the next available port
- You can specify a port: `npm run dev -- --port 3000`

**Build errors:**

- Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
- Check that all peer dependencies are satisfied

## License

This project is private and not licensed for public use.
