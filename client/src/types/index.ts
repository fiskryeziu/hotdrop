// Product types
export interface Category {
    id: number;
    name: string;
    description: string | null;
    displayOrder: number;
    createdAt: string;
}

export interface ProductOption {
    name: string;
    type: 'single' | 'multiple';
    required: boolean;
    choices: { label: string; price: number }[];
}

export interface Product {
    id: number;
    categoryId: number;
    name: string;
    description: string | null;
    price: string;
    options: ProductOption[];
    imageUrl: string | null;
    createdAt: string;
}

// Order types
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface Order {
    id: number;
    userId: string;
    status: string;
    total: string;
    deliveryAddress: string | null;
    deliveryLat: string | null;
    deliveryLng: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date | null;
}

export interface SelectedOption {
    name: string;
    choice: string;
    price: number;
}

export interface OrderItem {
    id: number;
    orderId: number;
    productId: number;
    quantity: number;
    selectedOptions: SelectedOption[];
    subtotal: string;
}

export interface OrderWithItems {
    order: Order;
    items: OrderItem[];
}

// User types
export interface User {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    role: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Session {
    user: User;
    session: {
        id: string;
        userId: string;
        expiresAt: string;
        token: string;
    };
}

// Cart types
export interface CartItem {
    product: Product;
    quantity: number;
    selectedOptions: SelectedOption[];
    subtotal: number;
}

// Driver location
export interface DriverLocation {
    orderId: string;
    lat: number;
    lng: number;
}
