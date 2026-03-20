export interface Product {
    _id?: string;
    id?: number;
    name: string;
    price: number;
    category: string;
    image: string;
    images?: string[];
    description: string;
    rating: number;
    inStock: boolean;
}

export const products: Product[] = [
    {
        id: 1,
        name: 'Wireless Headphones',
        price: 79.99,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
        description: 'High-quality wireless headphones with noise cancellation and premium sound quality.',
        rating: 4.5,
        inStock: true
    },
    {
        id: 2,
        name: 'Smart Watch',
        price: 199.99,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
        description: 'Feature-rich smartwatch with fitness tracking, heart rate monitor, and notifications.',
        rating: 4.7,
        inStock: true
    },
    {
        id: 3,
        name: 'Laptop Backpack',
        price: 49.99,
        category: 'Accessories',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
        description: 'Durable and spacious backpack designed for laptops up to 15 inches.',
        rating: 4.3,
        inStock: true
    },
    {
        id: 4,
        name: 'Bluetooth Speaker',
        price: 59.99,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop',
        description: 'Portable Bluetooth speaker with 360-degree sound and 12-hour battery life.',
        rating: 4.6,
        inStock: true
    },
    {
        id: 5,
        name: 'Running Shoes',
        price: 89.99,
        category: 'Sports',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
        description: 'Comfortable running shoes with excellent cushioning and support.',
        rating: 4.4,
        inStock: false
    },
    {
        id: 6,
        name: 'Coffee Maker',
        price: 129.99,
        category: 'Home',
        image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500&h=500&fit=crop',
        description: 'Programmable coffee maker with built-in grinder and thermal carafe.',
        rating: 4.8,
        inStock: true
    },
    {
        id: 7,
        name: 'Yoga Mat',
        price: 29.99,
        category: 'Sports',
        image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&h=500&fit=crop',
        description: 'Premium yoga mat with extra thickness and non-slip surface.',
        rating: 4.5,
        inStock: true
    },
    {
        id: 8,
        name: 'Desk Lamp',
        price: 39.99,
        category: 'Home',
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&h=500&fit=crop',
        description: 'LED desk lamp with adjustable brightness and flexible arm.',
        rating: 4.2,
        inStock: true
    }
];
