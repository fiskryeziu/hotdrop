# HotDrop - Food Delivery Application

A modern, full-stack food delivery application with real-time order tracking.

## Tech Stack

### Frontend
- React 19 + TypeScript
- Tailwind CSS 4
- shadcn/ui components
- React Router
- React Query
- Socket.IO Client
- Leaflet (maps)
- Better Auth

### Backend
- Node.js + Express
- PostgreSQL + Drizzle ORM
- Socket.IO
- Better Auth

## Quick Start with Docker

### Prerequisites
- Docker
- Docker Compose

### Running the Application

1. **Clone the repository**
```bash
git clone <repository-url>
cd hotdrop
```

2. **Set up environment variables**
```bash
cd server
cp .env.example .env
# The .env file is pre-configured for Docker, but you can edit secrets if needed.
```

3. **Start all services**
```bash
cd ..
docker-compose up -d --build
```

This will start:
- **Frontend**: http://localhost:5173 (Vite dev server with hot reload)
- **Backend API**: http://localhost:3000
- **PostgreSQL**: localhost:5432

4. **Run database migrations**
```bash
docker-compose exec backend npm run db:push
```

5. **Seed the database (optional)**
```bash
docker-compose exec backend npm run seed
```

### Stopping the Application
```bash
docker-compose down
```

To remove volumes as well:
```bash
docker-compose down -v
```

## Development Setup (Without Docker)

### Backend
```bash
cd server
npm install
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

## Features

### For Customers
- Browse products and menu
- Add items to cart with customizable options
- Checkout with delivery address
- Real-time order tracking
- Live driver location on map

### For Admins
- Dashboard with order statistics
- Manage all orders
- Update order statuses
- Real-time notifications for new orders

### For Delivery Drivers
- View available deliveries
- Start delivery tracking
- Automatic location sharing with customers
- Real-time updates

## API Endpoints

### Products
- `GET /api/products` - List all products
- `GET /api/products/product/:productId` - Get product details
- `GET /api/products/product/category/:categoryId` - Filter by category

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:orderId` - Get order details
- `PUT /api/orders/:orderId` - Update order status

### Authentication
- `POST /api/auth/sign-up` - Register
- `POST /api/auth/sign-in` - Login
- `POST /api/auth/sign-out` - Logout
- `GET /api/users/me` - Get current user

## Real-time Events (Socket.IO)

- `joinOrderRoom` - Subscribe to order updates
- `driverLocation` - Driver location updates
- `order-created` - New order notification (admin)
- `order-status-updated` - Order status changes

## Environment Variables

Create a `.env` file in the `server` directory:

```env
DATABASE_URL=postgresql://user:password@postgres:5432/hotdrop
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000
```

## Architecture

```
hotdrop/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts
│   │   ├── hooks/       # Custom hooks
│   │   ├── lib/         # API clients, utilities
│   │   └── types/       # TypeScript types
│   ├── Dockerfile
│   └── nginx.conf
├── server/              # Express backend
│   ├── controller/      # Route controllers
│   ├── routes/          # API routes
│   ├── db/              # Database schema
│   ├── middleware/      # Express middleware
│   └── Dockerfile
└── docker-compose.yml   # Docker orchestration
```

## License

MIT
