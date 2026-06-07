import React, { useState, useEffect } from 'react';
import { Sun, Moon, History, ShoppingBag, TrendingUp } from 'lucide-react';

export default function Header({ 
  darkMode, 
  toggleDarkMode, 
  toggleHistoryDrawer, 
  transactionsCount, 
  totalSalesToday 
}) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <header className="glass-panel app-header header-wrapper animate-fade-in">
      <div className="header-left">
        <div className="header-logo">KK</div>
        <div className="header-title-group">
          <h1>KasirKu</h1>
          <p>Sistem Kasir Digital Premium</p>
        </div>
      </div>

      <div className="header-right">
        {/* Real-time Date & Time */}
        <div className="date-time-badge">
          <div>{formatDate(time)}</div>
          <div style={{ fontWeight: '700', color: 'var(--primary-color)', textAlign: 'center', marginTop: '0.15rem' }}>
            {formatTime(time)}
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="date-time-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={16} className="text-success" style={{ color: 'var(--success-color)' }} />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Penjualan</div>
            <div style={{ fontWeight: '700' }}>{formatPrice(totalSalesToday)}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <button 
          className="icon-btn" 
          onClick={toggleHistoryDrawer}
          title="Riwayat Transaksi"
          aria-label="Riwayat Transaksi"
        >
          <History size={20} />
          {transactionsCount > 0 && (
            <span className="badge badge-primary">{transactionsCount}</span>
          )}
        </button>

        <button 
          className="icon-btn" 
          onClick={toggleDarkMode}
          title={darkMode ? 'Mode Terang' : 'Mode Gelap'}
          aria-label="Toggle Theme"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
}
