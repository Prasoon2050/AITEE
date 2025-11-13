# AITEE Store - E-commerce Web Application

A modern, responsive e-commerce web application built with React.

## Features

- 🏠 **Home Page** - Hero section, features showcase, and category navigation
- 📦 **Product Catalog** - Browse products with search, filter, and sort functionality
- 🔍 **Product Details** - Detailed product information with ratings and stock status
- 🛒 **Shopping Cart** - Add/remove items, adjust quantities, with localStorage persistence
- 💳 **Checkout** - Complete checkout flow with form validation
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices

## Technologies Used

- React 19.2.0
- React Router DOM for navigation
- Vite for fast development and optimized builds
- Context API for state management
- LocalStorage for cart persistence
- Modern CSS with responsive design

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/Prasoon2050/AITEE.git
cd AITEE/frontend
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The production build will be created in the `dist` folder.

### Linting

```bash
npm run lint
```

## Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Header.jsx
│   │   └── ProductCard.jsx
│   ├── pages/            # Page components
│   │   ├── Home.jsx
│   │   ├── Products.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── Cart.jsx
│   │   └── Checkout.jsx
│   ├── context/          # React Context for state management
│   │   └── CartContext.jsx
│   ├── data/             # Static data
│   │   └── products.js
│   ├── App.jsx           # Main app component
│   └── main.jsx          # Entry point
├── public/               # Static assets
└── index.html           # HTML template
```

## License

MIT