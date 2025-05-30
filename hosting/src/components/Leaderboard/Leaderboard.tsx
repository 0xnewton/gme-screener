import "./leaderboard.css";
import "../../theme.css";
import { Token } from "../../lib/types";
import { useState, useEffect } from "react";
import React from "react";

interface LeaderboardProps {
  loading?: boolean;
  tokens: Token[];
}

export const Leaderboard = (props: LeaderboardProps): JSX.Element => {
  const { loading, tokens } = props;

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const tokensPerPage = 50;
  
  // Calculate aggregate stats from ALL tokens
  const totalMarketCap = tokens.reduce((sum, token) => sum + token.marketCapUsd, 0);
  const total24hVolume = tokens.reduce((sum, token) => sum + token.volume24hUsd, 0);
  const total24hTransactions = tokens.reduce((sum, token) => sum + (token.txns24h.buys + token.txns24h.sells), 0);
  const coinLaunches = tokens.length;

  // Pagination calculations
  const totalPages = Math.ceil(tokens.length / tokensPerPage);
  const startIndex = (currentPage - 1) * tokensPerPage;
  const endIndex = startIndex + tokensPerPage;
  const currentTokens = tokens.slice(startIndex, endIndex);

  // Reset to page 1 when tokens change
  useEffect(() => {
    setCurrentPage(1);
  }, [tokens.length]);

  const formatCurrency = (value: number): string => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatPrice = (value: number): string => {
    if(value.toFixed(6) == 'NaN'){
      return `$0.000000`;
    }
    return `$${value.toFixed(6)}`;
  };

  const formatMarketCap = (value: number): string => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatNumber = (value: number): string => {
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
    return value.toString();
  };

  const formatPercentage = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="leaderboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      {/* Header */}
      <div className="leaderboard-header">
        <h1>🚀 GME Screener</h1>
        <p>Real-time token leaderboard</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Market Cap</div>
          <div className="stat-value">{formatCurrency(totalMarketCap)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">24h Volume</div>
          <div className="stat-value">{formatCurrency(total24hVolume)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">24h Transactions</div>
          <div className="stat-value">{formatNumber(total24hTransactions)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Coin Launches</div>
          <div className="stat-value">{coinLaunches}</div>
        </div>
      </div>

      {/* Token List */}
      <div className="token-list">
        <div className="token-list-header">
          <div className="header-rank">#</div>
          <div className="header-token">Token</div>
          <div className="header-price">Price</div>
          <div className="header-change">24h Change</div>
          <div className="header-volume">24h Volume</div>
          <div className="header-mcap">Market Cap</div>
        </div>

        {currentTokens.map((token, index) => (
          <div key={token.mintAddress} className="token-row">
            <div className="token-rank">
              {startIndex + index + 1}
            </div>
            
            <div className="token-info">
              <div className="token-image">
                {token.imageURI ? (
                  <img 
                    src={token.imageURI} 
                    alt={token.symbol}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`token-placeholder ${token.imageURI ? 'hidden' : ''}`}>
                  {token.symbol?.charAt(0) || '?'}
                </div>
              </div>
              <div className="token-details">
                <div className="token-symbol">{token.symbol}</div>
                <div className="token-name">{token.name}</div>
              </div>
            </div>

            <div className="token-price">
              {formatPrice(token.priceUsd)=='NaN' ?  formatPrice(0) : formatPrice(token.priceUsd)}

            </div>

            <div className={`token-change ${token.priceChange24hPct >= 0 ? 'positive' : 'negative'}`}>
              {formatPercentage(token.priceChange24hPct)}
            </div>

            <div className="token-volume">
            {formatCurrency(token.volume24hUsd) || formatCurrency(0)}
            </div>

            <div className="token-mcap">
              {formatMarketCap(token.marketCapUsd)}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          <div className="pagination-info">
            <span className="page-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(pageNum => {
                  if (pageNum === 1 || pageNum === totalPages) return true;
                  return Math.abs(pageNum - currentPage) <= 2;
                })
                .map((pageNum, index, filteredPages) => (
                  <React.Fragment key={pageNum}>
                    {index > 0 && pageNum - filteredPages[index - 1] > 1 && (
                      <span className="dots">...</span>
                    )}
                    <button
                      className={`page-btn ${pageNum === currentPage ? 'active' : ''}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  </React.Fragment>
                ))
              }
            </span>
            
            <span className="page-text">
              Page {currentPage} of {totalPages} • Showing {startIndex + 1}-{Math.min(endIndex, tokens.length)} of {tokens.length} tokens
            </span>
          </div>
          
          <button 
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {tokens.length === 0 && !loading && (
        <div className="empty-state">
          <p>No tokens found</p>
        </div>
      )}
    </div>
  );
};