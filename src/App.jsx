import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ProductCatalog from './components/ProductCatalog';
import Cart from './components/Cart';
import CheckoutModal from './components/CheckoutModal';
import HistoryDrawer from './components/HistoryDrawer';

export default function App() {
  // Application States
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [transactions, setTransactions] = useState([]);
  
  const [darkMode, setDarkMode] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  // Checkout & Cart promo states
  const [calculations, setCalculations] = useState({ subtotal: 0, taxAmount: 0, discountAmount: 0, total: 0 });
  const [promoCode, setPromoCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('CASH');

  // Fetch products from Laravel API
  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/api/products');
      if (!response.ok) {
        throw new Error('Gagal mengambil data produk dari server API.');
      }
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load theme preference from localStorage and fetch products on init
  useEffect(() => {
    const savedTheme = localStorage.getItem('kasirku-theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.body.classList.add('dark-mode');
    }
    fetchProducts();
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('kasirku-theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('kasirku-theme', 'light');
    }
  };

  // Add Item to Cart (with Stock Deductions)
  const handleAddToCart = (product) => {
    // Find product in database
    const dbProduct = products.find(p => p.id === product.id);
    if (!dbProduct || dbProduct.stock <= 0) return;

    // Deduct stock in catalog state
    setProducts(prevProducts => 
      prevProducts.map(p => 
        p.id === product.id ? { ...p, stock: p.stock - 1 } : p
      )
    );

    // Add to cart state
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { 
          id: product.id, 
          name: product.name, 
          price: product.price, 
          quantity: 1, 
          image: product.image 
        }];
      }
    });
  };

  // Update Cart Quantity (managing catalog inventory stocks)
  const handleUpdateQty = (productId, delta) => {
    const cartItem = cart.find(item => item.id === productId);
    if (!cartItem) return;

    const dbProduct = products.find(p => p.id === productId);

    if (delta === 1) {
      // Trying to add quantity: check if catalog stock is available
      if (!dbProduct || dbProduct.stock <= 0) {
        alert('Stok barang sudah habis!');
        return;
      }
      
      // Deduct stock in catalog
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === productId ? { ...p, stock: p.stock - 1 } : p
        )
      );

      // Increment in cart
      setCart(prevCart => 
        prevCart.map(item => 
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else if (delta === -1) {
      // Trying to reduce quantity: increment catalog stock
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === productId ? { ...p, stock: p.stock + 1 } : p
        )
      );

      if (cartItem.quantity <= 1) {
        // Remove item from cart if quantity falls to 0
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
      } else {
        // Decrement in cart
        setCart(prevCart => 
          prevCart.map(item => 
            item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
          )
        );
      }
    }
  };

  // Remove Item from Cart (returning all items back to stock)
  const handleRemoveItem = (productId) => {
    const cartItem = cart.find(item => item.id === productId);
    if (!cartItem) return;

    // Restore stock
    setProducts(prevProducts => 
      prevProducts.map(p => 
        p.id === productId ? { ...p, stock: p.stock + cartItem.quantity } : p
      )
    );

    // Remove from cart
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  // Clear Cart (returning all item stocks)
  const handleClearCart = () => {
    cart.forEach(item => {
      setProducts(prevProducts => 
        prevProducts.map(p => 
          p.id === item.id ? { ...p, stock: p.stock + item.quantity } : p
        )
      );
    });
    setCart([]);
  };

  // Checkout Initiation
  const handleCheckout = (calcs) => {
    setCalculations(calcs);
    setIsCheckoutOpen(true);
  };

  // Complete Payment Flow
  const handleCompleteSale = (saleRecord) => {
    setTransactions(prev => [saleRecord, ...prev]);
    // Clear cart permanently (no stock restoration because sale is finalized)
    setCart([]);
    // Reset voucher configurations
    setPromoCode('');
    setDiscountPercentage(0);
    // Refresh products stock count from Laravel database
    fetchProducts();
  };

  // Clear Session Transactions History
  const handleClearHistory = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus seluruh riwayat transaksi di sesi ini?')) {
      setTransactions([]);
    }
  };

  // Statistics calculation for Header
  const totalSalesToday = transactions.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="app-container">
      {/* Header Panel */}
      <Header 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode}
        toggleHistoryDrawer={() => setIsHistoryOpen(true)}
        transactionsCount={transactions.length}
        totalSalesToday={totalSalesToday}
      />

      {/* Main Grid View */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', width: '100%', gap: '1.5rem', color: 'var(--text-color)' }}>
          <div className="animate-spin" style={{ fontSize: '2.5rem', animation: 'spin 1s linear infinite' }}>🔄</div>
          <p style={{ fontWeight: '600', fontSize: '1.1rem' }}>Memuat data produk dari server API...</p>
        </div>
      ) : error ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', width: '100%', gap: '1.5rem', color: 'var(--danger-color)', padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem' }}>⚠️</div>
          <p style={{ fontWeight: '600', fontSize: '1.1rem', maxWidth: '400px' }}>Gagal menghubungkan ke server API: {error}</p>
          <button className="btn-primary" onClick={fetchProducts} style={{ padding: '0.75rem 2rem' }}>Coba Hubungkan Kembali</button>
        </div>
      ) : (
        <main style={{ display: 'contents' }}>
          {/* Left Side: Product Catalog */}
          <ProductCatalog 
            products={products} 
            onAddToCart={handleAddToCart} 
          />

          {/* Right Side: Cart Summary */}
          <Cart 
            cartItems={cart}
            onUpdateQty={handleUpdateQty}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onCheckout={handleCheckout}
            promoCode={promoCode}
            setPromoCode={setPromoCode}
            discountPercentage={discountPercentage}
            setDiscountPercentage={setDiscountPercentage}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
          />
        </main>
      )}

      {/* Pop-up Modals and Drawers */}
      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        calculations={calculations}
        paymentMethod={paymentMethod}
        onCompleteSale={handleCompleteSale}
      />

      <HistoryDrawer 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        transactions={transactions}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}
