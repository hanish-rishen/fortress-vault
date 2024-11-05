# Fortress Vault

A secure digital vault for storing encrypted text and files.

## Features

- Secure text encryption and storage
- File encryption and storage
- Drag and drop file upload
- User authentication
- Dark mode support
- Responsive design

## Key Technologies Used in Detail

### Core Framework
- Next.js 15.0.2 for full-stack development
  - Server and client-side rendering
  - API routes for backend functionality
  - File-system based routing
- React 19.0.0 for UI components
  - Hooks for state management
  - Custom components
- TypeScript for type safety
  - Strong typing
  - Interface definitions
  - Enhanced developer experience

### Database & ORM
- MySQL for data storage
  - Relational database structure
  - ACID compliance
  - Data integrity
- Prisma as the ORM layer
  - Type-safe database queries
  - Schema management
  - Migration handling

### Authentication & Security
- JWT and Jose for token management
  - Secure session handling
  - Token encryption
- Bcrypt for password hashing
  - Secure password storage
  - Salt generation
- CryptoJS for client-side encryption
  - AES encryption implementation
  - Secure data handling

### Styling
- TailwindCSS for responsive design
  - Utility-first CSS
  - Custom theming
  - Responsive breakpoints
- Dark mode support
  - System preference detection
  - Manual toggle option

### Development Tools
- ESLint for code linting
  - Code style enforcement
  - Error detection
- Various TypeScript types
  - Custom type definitions
  - Enhanced IDE support
  - Better development experience

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/fortress-vault.git
   cd fortress-vault
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file
   - Fill in required environment variables:
     ```
     DATABASE_URL="mysql://user:password@localhost:3306/fortress"
     JWT_SECRET="your-secret-key"
     ENCRYPTION_KEY="your-encryption-key"
     ```

4. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

- `DATABASE_URL`: MySQL connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `ENCRYPTION_KEY`: Key used for data encryption