import React from 'react';
import './MarketSelector.css';

function MarketSelector({ markets, selectedMarket, onSelectMarket }) {
  return (
    <div className="market-selector">
      <h2>Select Market</h2>
      <div className="market-grid">
        {markets.map((market) => (
          <button
            key={market.index}
            className={`market-card ${selectedMarket?.index === market.index ? 'active' : ''}`}
            onClick={() => onSelectMarket(market)}
          >
            <div className="market-name">{market.name}</div>
            <div className="market-type">Perpetual</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default MarketSelector;

