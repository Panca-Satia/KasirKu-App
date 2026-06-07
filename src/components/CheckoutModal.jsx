import React, { useState, useEffect } from 'react';
import { Check, X, Printer, Loader2 } from 'lucide-react';

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  cartItems, 
  calculations, 
  paymentMethod, 
  onCompleteSale 
}) {
  const [cashAmount, setCashAmount] = useState('');
  const [changeAmount, setChangeAmount] = useState(0);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [transactionTime, setTransactionTime] = useState('');

  const { subtotal, taxAmount, discountAmount, total } = calculations;

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setCashAmount('');
      setChangeAmount(0);
      setPaymentSuccess(false);
      setIsProcessing(false);
      
      // Generate standard transaction ID and timestamp
      const randId = 'TRX-' + Math.floor(100000 + Math.random() * 900000);
      setTransactionId(randId);
      setTransactionTime(new Date().toLocaleString('id-ID'));
    }
  }, [isOpen]);

  // Recalculate cash change
  useEffect(() => {
    const cash = parseFloat(cashAmount) || 0;
    if (cash >= total) {
      setChangeAmount(cash - total);
    } else {
      setChangeAmount(0);
    }
  }, [cashAmount, total]);

  if (!isOpen) return null;

  const handleCashInput = (value) => {
    setCashAmount(value);
  };

  const handleQuickCash = (amount) => {
    setCashAmount(amount.toString());
  };

  // Simulate payment processing for card/qris
  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
    }, 1500);
  };

  const handleCompleteCashSale = () => {
    const cash = parseFloat(cashAmount) || 0;
    if (cash < total) return;
    setPaymentSuccess(true);
  };

  const handleFinalize = () => {
    // Save to sales history and clear cart
    const finalRecord = {
      id: transactionId,
      time: transactionTime,
      items: [...cartItems],
      subtotal,
      taxAmount,
      discountAmount,
      total,
      paymentMethod,
      cashReceived: paymentMethod === 'CASH' ? parseFloat(cashAmount) : total,
      change: paymentMethod === 'CASH' ? changeAmount : 0
    };
    onCompleteSale(finalRecord);
    onClose();
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Suggest quick cash based on total price
  const getQuickCashSuggestions = () => {
    const suggestions = [];
    suggestions.push(total); // exact amount
    
    const bills = [10000, 20000, 50000, 100000, 200000];
    bills.forEach(bill => {
      if (bill > total && suggestions.indexOf(bill) === -1) {
        suggestions.push(bill);
      }
    });
    
    // Sort ascending
    return suggestions.sort((a, b) => a - b).slice(0, 4);
  };

  const cash = parseFloat(cashAmount) || 0;
  const isCashInsufficient = paymentMethod === 'CASH' && cash < total;

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-scale-in">
        <div className="modal-header">
          <h2 className="modal-title">
            {paymentSuccess ? 'Transaksi Sukses' : `Pembayaran ${paymentMethod}`}
          </h2>
          <button className="close-btn" onClick={onClose} aria-label="Tutup modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {!paymentSuccess ? (
            <>
              {/* Payment Flow View */}
              {paymentMethod === 'CASH' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="payment-input-group">
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                      Total Pembayaran:
                    </label>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary-color)' }}>
                      {formatPrice(total)}
                    </div>
                  </div>

                  <div className="payment-input-group">
                    <label htmlFor="cash-input" style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                      Nominal Uang Tunai (Rp):
                    </label>
                    <input 
                      id="cash-input"
                      type="number" 
                      placeholder="Masukkan jumlah uang..." 
                      className="input-field"
                      style={{ fontSize: '1.25rem', fontWeight: '700', padding: '0.75rem' }}
                      value={cashAmount}
                      onChange={(e) => handleCashInput(e.target.value)}
                      autoFocus
                    />
                  </div>

                  {/* Quick Cash Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                      Uang Pas / Pecahan Cepat:
                    </div>
                    <div className="quick-cash-grid">
                      {getQuickCashSuggestions().map((amount, idx) => (
                        <button 
                          key={idx} 
                          className="quick-cash-btn"
                          onClick={() => handleQuickCash(amount)}
                        >
                          {amount === total ? 'Uang Pas' : formatPrice(amount).replace('Rp', '').trim()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Change Calculator */}
                  {cash > 0 && (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      background: 'var(--primary-light)', 
                      padding: '0.75rem 1rem', 
                      borderRadius: '8px',
                      alignItems: 'center',
                      marginTop: '0.25rem'
                    }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Kembalian:</span>
                      <span style={{ 
                        fontSize: '1.2rem', 
                        fontWeight: '800', 
                        color: isCashInsufficient ? 'var(--danger-color)' : 'var(--success-color)' 
                      }}>
                        {isCashInsufficient ? 'Kurang Pembayaran' : formatPrice(changeAmount)}
                      </span>
                    </div>
                  )}

                  {isCashInsufficient && (
                    <div style={{ color: 'var(--danger-color)', fontSize: '0.75rem', textAlign: 'center' }}>
                      Jumlah uang tunai kurang dari total belanja!
                    </div>
                  )}

                  <button 
                    className="btn-primary" 
                    style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center' }}
                    onClick={handleCompleteCashSale}
                    disabled={isCashInsufficient || cash === 0}
                  >
                    Bayar & Buat Struk
                  </button>
                </div>
              )}

              {paymentMethod === 'QRIS' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    Silakan scan kode QRIS berikut menggunakan aplikasi dompet digital.
                  </div>
                  
                  <div className="qris-container">
                    {/* Simulated QR Code using design elements */}
                    <div className="qris-qr" style={{ display: 'flex', flexWrap: 'wrap', width: '150px', height: '150px', padding: '10px' }}>
                      <div style={{ width: '30px', height: '30px', background: '#000', border: '5px solid #fff' }}></div>
                      <div style={{ width: '70px', height: '30px', background: '#e2e8f0' }}></div>
                      <div style={{ width: '30px', height: '30px', background: '#000', border: '5px solid #fff' }}></div>
                      <div style={{ width: '40px', height: '70px', background: '#f1f5f9' }}></div>
                      <div style={{ width: '50px', height: '50px', background: '#4f46e5' }}></div>
                      <div style={{ width: '40px', height: '70px', background: '#cbd5e1' }}></div>
                      <div style={{ width: '30px', height: '30px', background: '#000', border: '5px solid #fff' }}></div>
                      <div style={{ width: '70px', height: '30px', background: '#94a3b8' }}></div>
                      <div style={{ width: '30px', height: '30px', background: '#000', border: '5px solid #fff' }}></div>
                    </div>
                    <div style={{ fontWeight: '700', color: 'var(--primary-color)', fontSize: '0.9rem' }}>
                      GPN / KasirKu QRIS
                    </div>
                  </div>

                  <div style={{ fontSize: '1.25rem', fontWeight: '800' }}>
                    {formatPrice(total)}
                  </div>

                  <button 
                    className="btn-primary" 
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={handleSimulatePayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        <span>Memproses Pembayaran...</span>
                      </>
                    ) : (
                      <span>Simulasikan Scan Sukses</span>
                    )}
                  </button>
                </div>
              )}

              {paymentMethod === 'CARD' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
                  <div className={`card-payment-simulate ${isProcessing ? 'processing' : ''}`} style={{ width: '100%' }}>
                    <div style={{ fontSize: '3rem' }}>💳</div>
                    <p style={{ fontSize: '0.85rem', fontWeight: '500', textAlign: 'center', marginTop: '0.5rem' }}>
                      {isProcessing ? 'Membaca Kartu & Mengotorisasi...' : 'Silakan Masukkan atau Tempel Kartu Kredit / Debit'}
                    </p>
                  </div>

                  <div style={{ fontSize: '1.25rem', fontWeight: '800' }}>
                    {formatPrice(total)}
                  </div>

                  <button 
                    className="btn-primary" 
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={handleSimulatePayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        <span>Mengotorisasi...</span>
                      </>
                    ) : (
                      <span>Simulasikan Gesek Kartu</span>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Receipt / Success view */}
              <div className="checkout-success-banner">
                <div className="success-circle">
                  <Check size={28} />
                </div>
                <h3 style={{ fontWeight: '700' }}>Pembayaran Berhasil!</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Struk telah digenerate di bawah ini.
                </p>
              </div>

              {/* Monospaced Receipt Layout */}
              <div className="receipt-box">
                <div className="receipt-header">
                  <div className="receipt-logo">KASIRKU POS</div>
                  <div>Jl. Raya Indonesia No. 88</div>
                  <div>Telp: (021) 123456</div>
                </div>

                <div className="receipt-row">
                  <span>No. Struk:</span>
                  <span>{transactionId}</span>
                </div>
                <div className="receipt-row">
                  <span>Tanggal:</span>
                  <span>{transactionTime}</span>
                </div>
                <div className="receipt-row">
                  <span>Kasir:</span>
                  <span>Administrator</span>
                </div>

                <div className="receipt-divider"></div>

                {/* Items */}
                {cartItems.map((item, index) => (
                  <div key={index} style={{ marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                    <div className="receipt-row" style={{ color: '#475569' }}>
                      <span>{item.quantity} x {formatPrice(item.price)}</span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  </div>
                ))}

                <div className="receipt-divider"></div>

                <div className="receipt-row">
                  <span>Subtotal:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="receipt-row">
                  <span>PPN (11%):</span>
                  <span>{formatPrice(taxAmount)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="receipt-row">
                    <span>Diskon:</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                
                <div className="receipt-divider" style={{ borderTopStyle: 'double' }}></div>
                
                <div className="receipt-row receipt-total">
                  <span>TOTAL:</span>
                  <span>{formatPrice(total)}</span>
                </div>

                <div className="receipt-divider"></div>

                <div className="receipt-row">
                  <span>Tipe Bayar:</span>
                  <span>{paymentMethod}</span>
                </div>

                {paymentMethod === 'CASH' && (
                  <>
                    <div className="receipt-row">
                      <span>Bayar Tunai:</span>
                      <span>{formatPrice(parseFloat(cashAmount))}</span>
                    </div>
                    <div className="receipt-row">
                      <span>Kembalian:</span>
                      <span>{formatPrice(changeAmount)}</span>
                    </div>
                  </>
                )}

                <div className="receipt-divider" style={{ borderTopStyle: 'dashed' }}></div>

                <div style={{ textAlign: 'center', marginTop: '0.75rem', color: '#475569', fontSize: '0.8rem' }}>
                  Terima Kasih Atas Kunjungan Anda!
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', width: '100%', marginTop: '0.5rem' }}>
                <button 
                  className="btn-secondary" 
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => alert('Fitur cetak terhubung ke printer thermal local (Simulasi).')}
                >
                  <Printer size={16} />
                  <span>Cetak Struk</span>
                </button>
                <button 
                  className="btn-primary" 
                  style={{ flex: 1, justifyContent: 'center' }} 
                  onClick={handleFinalize}
                >
                  Selesai
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
