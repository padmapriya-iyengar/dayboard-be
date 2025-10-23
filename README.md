# DayBoard Backend API

A Node.js Express.js backend server with TypeScript for the DayBoard application.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration

### Running the Application

#### Development Mode

```bash
npm run dev
```

#### Production Mode

```bash
npm run build
npm start
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the TypeScript project
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm test` - Run tests

## 📁 Project Structure

```
src/
├── config/          # Configuration files
│   └── database.ts   # Database connection
├── controllers/      # Route controllers
├── middleware/       # Express middleware
│   ├── errorHandler.ts
│   └── notFoundHandler.ts
├── models/          # Database models
├── routes/          # Express routes
│   └── index.ts     # Main router
├── services/        # Business logic
├── types/           # TypeScript type definitions
│   └── index.ts     # Common interfaces
├── utils/           # Utility functions
│   └── helpers.ts   # Helper functions
└── server.ts        # Main server file
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# SQL Server Database Configuration
DB_SERVER=localhost
DB_PORT=1433
DB_NAME=dayboard
DB_USER=dayboard
DB_PASSWORD=dayboard
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# API Configuration
API_PREFIX=/api/v1
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Database Setup

1. **Run SQL Server Setup Script**:
   Open SQL Server Management Studio (SSMS) and run the script in `database/setup-user.sql` to create the dayboard user and database.

2. **Initialize Database Schema**:
   The application will automatically create the necessary tables on first run.

## 📊 API Endpoints

### Health Check

- `GET /health` - Server health status

### API Base

- `GET /api/v1` - API welcome message

### Future Endpoints (To be implemented)

- `POST /api/v1/auth/login` - User authentication
- `GET /api/v1/grocery` - Get grocery items
- `POST /api/v1/grocery` - Create grocery item
- `GET /api/v1/finance` - Get finance entries
- `POST /api/v1/finance` - Create finance entry
- `GET /api/v1/reminders` - Get reminders
- `POST /api/v1/reminders` - Create reminder
- `GET /api/v1/tasks` - Get tasks
- `POST /api/v1/tasks` - Create task

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: SQL Server with mssql package
- **Authentication**: JWT (planned)
- **Security**: Helmet, CORS, Rate Limiting
- **Development**: Nodemon, ESLint
- **Testing**: Jest (configured)

## 📝 Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow ESLint rules
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### Error Handling

- Use the centralized error handler
- Create custom error classes when needed
- Always handle async/await with try-catch

### Database

- Use Mongoose for MongoDB operations
- Define proper schemas with validation
- Use TypeScript interfaces for type safety

## 🚦 Next Steps

The backend infrastructure is ready. You can now:

1. **Start MongoDB** (if running locally)
2. **Implement specific modules** as needed:

   - User authentication
   - Grocery management
   - Finance tracking
   - Reminder system
   - Task management

3. **Add database models** for your entities
4. **Create API endpoints** for your frontend
5. **Add validation** with Joi or similar
6. **Implement authentication** with JWT

## 🔒 Security Features

- Helmet for security headers
- CORS configuration
- Rate limiting
- Input validation (ready for implementation)
- Environment variable protection

## 📈 Monitoring

- Morgan for HTTP request logging
- Custom error logging
- Health check endpoint

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

---

Ready for module implementation! Let me know what specific functionality you'd like to implement first.
DayBoard Back End
