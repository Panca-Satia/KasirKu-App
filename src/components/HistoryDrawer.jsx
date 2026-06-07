import React, { useState } from 'react';
import { X, Calendar, ShoppingBag, CreditCard, Banknote, QrCode } from 'lucide-react';

export default function HistoryDrawer({ isOpen, onClose, transactions, onClearHistory }) {
  const [expandedTxId, setExpandedTxId] = useState(null);

  if (!isOpen) return null;

  const toggleExpand = (id) => {
    if (expandedTxId === id) {
      setExpandedTxId(null);
    } else {
      setExpandedTxId(id);
    }
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getPaymentIcon = (method) => {
    switch(method) {
      case 'CASH':
        return <Banknote size={16} style={{ color: 'var(--success-color)' }} />;
      case 'QRIS':
        return <QrCode size={16} style={{ color: 'var(--primary-color)' }} />;
      case 'CARD':
        return <CreditCard size={16} style={{ color: 'var(--accent-color)' }} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="history-overlay" onClick={onClose}></div>
      <div className="history-drawer">
        <div className="history-header">
          <h2 className="history-title">
            <Calendar size={20} />
            <span>Riwayat Transaksi</span>
          </h2>
          <button className="close-btn" onClick={onClose} aria-label="Tutup riwayat">
            <X size={20} />
          </button>
        </div>

        {transactions.length > 0 && (
          <button 
            className="btn-secondary" 
            style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem', justifyContent: 'center' }}
            onClick={onClearHistory}
          >
            Bersihkan Riwayat Sesi
          </button>
        )}

        <div className="history-list">
          {transactions.length > 0 ? (
            transactions.map((tx) => {
              const isExpanded = expandedTxId === tx.id;
              return (
                <div key={tx.id} className="history-item" onClick={() => toggleExpand(tx.id)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{tx.id}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{tx.time.split(',')[1] || tx.time}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {getPaymentIcon(tx.paymentMethod)}
                      <span>{tx.paymentMethod}</span>
                    </div>
                    <span style={{ fontWeight: '700', color: 'var(--primary-color)', fontSize: '0.9rem' }}>
                      {formatPrice(tx.total)}
                    </span>
                  </div>

                  {/* Expanded Items view */}
                  {isExpanded && (
                    <div style={{ 
                      marginTop: '0.75rem', 
                      borderTop: '1px dashed var(--border-color)', 
                      paddingTop: '0.5rem', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '0.25rem',
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)'
                    }}>
                      {tx.items.map((item, index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>{item.name} (x{item.quantity})</span>
                          <span>{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                      
                      <div style={{ borderTop: '1px solid var(--border-color)', margin: '0.25rem 0' }}></div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-main)', fontWeight: '600' }}>
                        <span>Total</span>
                        <span>{formatPrice(tx.total)}</span>
                      </div>
                      {tx.paymentMethod === 'CASH' && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                          <span>Bayar / Kembali</span>
                          <span>{formatPrice(tx.cashReceived)} / {formatPrice(tx.change)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.75rem', 
              padding: '4rem 1rem', 
              color: 'var(--text-muted)',
              textAlign: 'center'
            }}>
              <ShoppingBag size={40} strokeWidth={1.2} />
              <p style={{ fontSize: '0.85rem' }}>Belum ada transaksi di sesi ini.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
