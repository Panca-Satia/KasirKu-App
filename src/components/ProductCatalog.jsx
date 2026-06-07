import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';

export default function ProductCatalog({ products, onAddToCart }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('semua');

  const uniqueCategories = ['semua', ...new Set(products.map(p => p.category))];
  const categories = uniqueCategories.map(cat => ({
    id: cat,
    name: cat === 'semua' ? 'Semua Menu' : cat
  }));

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'semua' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatPrice = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="glass-panel catalog-panel animate-fade-in">
      <div className="catalog-actions">
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: 0 }}>Daftar Menu</h2>
        
        {/* Search Bar */}
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Cari makanan atau minuman..." 
            className="input-field"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="category-filter">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-tab ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="products-grid">
          {filteredProducts.map((product) => {
            const isOutOfStock = product.stock <= 0;
            return (
              <div key={product.id} className="product-card">
                <div className="product-image-container">
                  <span>{product.image}</span>
                  <div className="product-stock">
                    {isOutOfStock ? (
                      <span className="badge badge-danger">Habis</span>
                    ) : product.stock <= 5 ? (
                      <span className="badge badge-warning">Stok {product.stock}</span>
                    ) : (
                      <span className="badge badge-success">Stok {product.stock}</span>
                    )}
                  </div>
                </div>
                
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-desc">{product.description}</p>
                  
                  <div className="product-footer">
                    <span className="product-price">{formatPrice(product.price)}</span>
                    <button 
                      className="add-to-cart-btn" 
                      onClick={() => onAddToCart(product)}
                      disabled={isOutOfStock}
                      title={isOutOfStock ? 'Stok Habis' : 'Tambah ke Keranjang'}
                      aria-label={`Tambah ${product.name} ke keranjang`}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
          Menu tidak ditemukan. Silakan cari kata kunci lain.
        </div>
      )}
    </div>
  );
}
