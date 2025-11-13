import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to AITEE Store</h1>
          <p className="hero-subtitle">
            Discover amazing products at unbeatable prices
          </p>
          <Link to="/products" className="cta-button">
            Shop Now
          </Link>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title">Why Shop With Us?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚚</div>
              <h3>Free Shipping</h3>
              <p>Free delivery on orders over $50</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>Secure Payment</h3>
              <p>100% secure payment processing</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔄</div>
              <h3>Easy Returns</h3>
              <p>30-day return policy for all items</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3>Quality Products</h3>
              <p>Only the best products for you</p>
            </div>
          </div>
        </div>
      </section>

      <section className="categories">
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          <div className="categories-grid">
            <Link to="/products?category=Electronics" className="category-card">
              <h3>Electronics</h3>
            </Link>
            <Link to="/products?category=Sports" className="category-card">
              <h3>Sports</h3>
            </Link>
            <Link to="/products?category=Home" className="category-card">
              <h3>Home</h3>
            </Link>
            <Link to="/products?category=Accessories" className="category-card">
              <h3>Accessories</h3>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
