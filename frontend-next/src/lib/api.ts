const API_URL = 'http://localhost:5000/api';

export const fetchProducts = async () => {
    const res = await fetch(`${API_URL}/products`);
    if (!res.ok) {
        throw new Error('Failed to fetch products');
    }
    return res.json();
};

export const fetchProductById = async (id: string) => {
    const res = await fetch(`${API_URL}/products/${id}`);
    if (!res.ok) {
        throw new Error('Failed to fetch product');
    }
    return res.json();
};

export const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${API_URL}/images/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!res.ok) {
        throw new Error('Failed to upload image');
    }
    return res.json();
};

export const login = async (credentials: any) => {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Login failed');
    }
    return res.json();
};

export const signup = async (userData: any) => {
    const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Signup failed');
    }
    return res.json();
};

export const createReview = async (productId: string, review: { rating: number; comment: string }, token: string) => {
    const res = await fetch(`${API_URL}/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(review),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to submit review');
    }
    return res.json();
};
