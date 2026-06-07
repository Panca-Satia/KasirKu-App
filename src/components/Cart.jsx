import React, { useState } from 'react';
import { ShoppingCart, Trash2, Ticket, CreditCard, QrCode, Banknote } from 'lucide-react';

export default function Cart({ 
  cartItems, 
  onUpdateQty, 
  onRemoveItem, 
  onClearCart, 
  onCheckout,
  promoCode,
  setPromoCode,
  discountPercentage,
  setDiscountPercentage,
  paymentMethod,
  setPaymentMethod
}) {
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const taxRate = 0.11; // PPN 11%
  const taxAmount = Math.round(subtotal * taxRate);
  
  const discountAmount = Math.round(subtotal * (discountPercentage / 100));
  const total = subtotal + taxAmount - discountAmount;

  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError('');
    
    const code = promoInput.trim().toUpperCase();
    if (code === 'PROMO10') {
      setPromoCode('PROMO10');
      setDiscountPercentage(10);
      setPromoInput('');
    } else if (code === 'KASIRBARU') {
      setPromoCode('KASIRBARU');
      setDiscountPercentage(15);
      setPromoInput('');
    } else if (code === '') {
      setPromoError('Masukkan kode promo terlebih dahulu.');
    } else {
      setPromoError('Kode promo tidak valid.');
    }
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setDiscountPercentage(0);
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const paymentOptions = [
    { id: 'CASH', name: 'Tunai', icon: <Banknote size={18} /> },
    { id: 'QRIS', name: 'QRIS', icon: <QrCode size={18} /> },
    { id: 'CARD', name: 'Kartu', icon: <CreditCard size={18} /> }
  ];

  return (
    <div className="glass-panel cart-panel animate-fade-in">
      <div className="cart-header">
        <div className="cart-title">
          <ShoppingCart size={20} className="text-primary" style={{ color: 'var(--primary-color)' }} />
          <span>Keranjang Belanja</span>
          {cartItems.length > 0 && (
            <span className="badge badge-primary">{cartItems.reduce((a, b) => a + b.quantity, 0)}</span>
          )}
        </div>
        
        {cartItems.length > 0 && (
          <button className="clear-cart-btn" onClick={onClearCart} title="Kosongkan Keranjang">
            <Trash2 size={16} />
            <span>Bersihkan</span>
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="cart-items">
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <span className="cart-item-emoji">{item.image}</span>
              
              <div className="cart-item-info">
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-item-price">{formatPrice(item.price)}</div>
              </div>

              <div className="cart-item-actions">
                <button className="qty-btn" onClick={() => onUpdateQty(item.id, -1)}>-</button>
                <span className="cart-item-qty">{item.quantity}</span>
                <button className="qty-btn" onClick={() => onUpdateQty(item.id, 1)}>+</button>
              </div>

              <div className="cart-item-subtotal">
                {formatPrice(item.price * item.quantity)}
              </div>
            </div>
          ))
        ) : (
          <div className="cart-empty">
            <ShoppingCart size={48} strokeWidth={1.2} style={{ color: 'var(--text-muted)' }} />
            <p style={{ fontWeight: '500' }}>Keranjang Anda masih kosong</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pilih menu di sebelah kiri untuk ditambahkan</p>
          </div>
        )}
      </div>

      {/* Summary and Calculations */}
      {cartItems.length > 0 && (
        <div className="cart-summary">
          {/* Promo Code Form */}
          {!promoCode ? (
            <form onSubmit={handleApplyPromo} className="promo-wrapper">
              <input 
                type="text" 
                placeholder="Kode Promo (PROMO10 / KASIRBARU)" 
                className="input-field" 
                style={{ fontSize: '0.85rem' }}
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
              />
              <button type="submit" className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                Gunakan
              </button>
            </form>
          ) : (
            <div className="promo-tag">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Ticket size={14} />
                <span>Kupon Aktif: <strong>{promoCode}</strong> (Diskon {discountPercentage}%)</span>
              </div>
              <button onClick={handleRemovePromo} title="Hapus Promo">×</button>
            </div>
          )}

          {promoError && (
            <div style={{ fontSize: '0.75rem', color: 'var(--danger-color)', marginTop: '-0.25rem' }}>
              {promoError}
            </div>
          )}

          {/* Pricing Details */}
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>

          <div className="summary-row">
            <span>Pajak (PPN 11%)</span>
            <span>{formatPrice(taxAmount)}</span>
          </div>

          {discountPercentage > 0 && (
            <div className="summary-row" style={{ color: 'var(--success-color)' }}>
              <span>Diskon</span>
              <span>-{formatPrice(discountAmount)}</span>
            </div>
          )}

          <div className="summary-row total">
            <span>Total Bayar</span>
            <span className="total-price">{formatPrice(total)}</span>
          </div>

          {/* Payment Method Tabs */}
          <div className="payment-section">
            <div className="payment-title">Metode Pembayaran</div>
            <div className="payment-options">
              {paymentOptions.map((opt) => (
                <button
                  key={opt.id}
                  className={`payment-tab ${paymentMethod === opt.id ? 'active' : ''}`}
                  onClick={() => setPaymentMethod(opt.id)}
                >
                  {opt.icon}
                  <span>{opt.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Checkout Button */}
          <button 
            className="btn-primary pay-btn" 
            onClick={() => onCheckout({ subtotal, taxAmount, discountAmount, total })}
          >
            Bayar Sekarang ({formatPrice(total)})
          </button>
        </div>
      )}
    </div>
  );
}
