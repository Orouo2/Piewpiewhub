"use client";

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { Search } from 'lucide-react';
import { ValueType } from 'recharts/types/component/DefaultTooltipContent';

const CryptoGraph = () => {
  // États pour les données et les options de l'utilisateur
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState('bitcoin');
  const [timeRange, setTimeRange] = useState('30');
  const [currency, setCurrency] = useState('usd');
  const [chartType, setChartType] = useState('line');
  const [priceInfo, setPriceInfo] = useState({ price: '0.00', change: '0.00' });
  const [cryptoList, setCryptoList] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Options de période
  const timeRangeOptions = [
    { value: '1', label: '24 heures' },
    { value: '7', label: '7 jours' },
    { value: '30', label: '30 jours' },
    { value: '90', label: '3 mois' },
    { value: '365', label: '1 an' },
    { value: 'max', label: 'Max' }
  ];
  
  // Options de devise
  const currencyOptions = [
    { value: 'usd', label: 'USD' },
    { value: 'eur', label: 'EUR' },
    { value: 'gbp', label: 'GBP' },
    { value: 'jpy', label: 'JPY' }
  ];

  // Fonction pour obtenir la liste des top 100 cryptomonnaies
  const fetchCryptoList = async () => {
    setIsLoadingList(true);
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=100&page=1`
      );
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Formater les données pour la liste déroulante
      const formattedList = data.map((coin: { id: any; symbol: string; name: any; image: any; current_price: any; market_cap_rank: any; price_change_percentage_24h: any; }) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        image: coin.image,
        current_price: coin.current_price,
        market_cap_rank: coin.market_cap_rank,
        price_change_percentage_24h: coin.price_change_percentage_24h
      }));
      
      setCryptoList(formattedList);
    } catch (err) {
      console.error('Erreur lors de la récupération de la liste des cryptomonnaies:', err);
    } finally {
      setIsLoadingList(false);
    }
  };

  // Fonction pour obtenir les données de la cryptomonnaie sélectionnée
  const fetchChartData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${selectedCrypto}/market_chart?vs_currency=${currency}&days=${timeRange}`
      );
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Formater les données pour le graphique
      const prices = data.prices;
      
      // Formater les données pour Recharts
      const formattedData = prices.map((item: any[]) => {
        const date = new Date(item[0]);
        // Format différent selon la période
        let dateLabel;
        if (timeRange === '1') {
          // Format heure pour 24h
          dateLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (timeRange === '7' || timeRange === '30') {
          // Format jour + mois pour 7j et 30j
          dateLabel = date.toLocaleDateString([], { day: 'numeric', month: 'short' });
        } else {
          // Format complet pour périodes plus longues
          dateLabel = date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
        }
        
        return {
          date: dateLabel,
          timestamp: item[0],
          price: item[1]
        };
      });
      
      // Réduire le nombre de points pour les longues périodes
      const skipFactor = timeRange === 'max' ? 12 : 
                        timeRange === '365' ? 6 : 
                        timeRange === '90' ? 3 : 1;
      
      const filteredData = skipFactor > 1 
        ? formattedData.filter((_: any, index: number) => index % skipFactor === 0)
        : formattedData;
      
      setChartData(filteredData);
      
      // Calculer le prix actuel et le pourcentage de changement
      if (prices.length > 0) {
        const startPrice = prices[0][1];
        const endPrice = prices[prices.length - 1][1];
        const change = ((endPrice - startPrice) / startPrice) * 100;
        
        setPriceInfo({
          price: endPrice.toFixed(2),
          change: change.toFixed(2)
        });
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des données:', err);
      setError('Impossible de charger les données. Veuillez réessayer plus tard.');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger la liste des cryptomonnaies au chargement
  useEffect(() => {
    fetchCryptoList();
  }, [currency]);

  // Charger les données du graphique lorsque les filtres changent
  useEffect(() => {
    fetchChartData();
  }, [selectedCrypto, timeRange, currency, chartType]);

  // Filtrer la liste des cryptomonnaies en fonction du terme de recherche
  const filteredCryptoList = cryptoList.filter((crypto: { name: string; symbol: string }) => 
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sélectionner une cryptomonnaie dans la liste
  const handleSelectCrypto = (cryptoId: React.SetStateAction<string>) => {
    setSelectedCrypto(cryptoId);
    setShowDropdown(false);
    setSearchTerm('');
  };

  // Déterminer la couleur en fonction de la tendance
  const isPositive = parseFloat(priceInfo.change) >= 0;
  const trendColor = isPositive ? '#2ecc71' : '#e74c3c';

  // Obtenir le nom complet de la cryptomonnaie sélectionnée
  const selectedCryptoInfo = cryptoList.find((crypto: { id: string; symbol: string; name: string; image: string; current_price: number; market_cap_rank: number; price_change_percentage_24h: number }) => crypto.id === selectedCrypto) as { id: string; symbol: string; name: string; image: string; current_price: number; market_cap_rank: number; price_change_percentage_24h: number } | undefined;
  const cryptoName = selectedCryptoInfo ? `${selectedCryptoInfo.name} (${selectedCryptoInfo.symbol})` : selectedCrypto;

  // Formatter les valeurs monétaires
  const formatCurrency = (value: ValueType | undefined) => {
    if (typeof value === 'number') {
      return `${value.toFixed(2)} ${currency.toUpperCase()}`;
    }
    return `0.00 ${currency.toUpperCase()}`;
  };

  return (
    <div className="w-full bg-gray-900 text-white rounded-lg shadow-lg p-4">
      {/* En-tête du graphique */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">{cryptoName}</h2>
          <div className="flex items-center mt-1">
            <span className="text-2xl font-semibold mr-2">
              {priceInfo.price} {currency.toUpperCase()}
            </span>
            <span className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '▲' : '▼'} {Math.abs(parseFloat(priceInfo.change))}%
            </span>
          </div>
        </div>
        
        {/* Contrôles */}
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          {/* Sélecteur de cryptomonnaies avec recherche */}
          <div className="relative">
            <div 
              className="bg-gray-800 text-white px-3 py-1 rounded border border-gray-700 flex items-center gap-2 cursor-pointer"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {selectedCryptoInfo && selectedCryptoInfo.image && (
                <img src={selectedCryptoInfo.image} alt={selectedCryptoInfo.symbol} className="w-5 h-5" />
              )}
              <span className="truncate max-w-32">
                {selectedCryptoInfo ? `${selectedCryptoInfo.symbol}` : 'Choisir'}
              </span>
              <span className="text-xs ml-1">{showDropdown ? '▲' : '▼'}</span>
            </div>
            
            {showDropdown && (
              <div className="absolute z-10 mt-1 w-64 bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-96 overflow-y-auto">
                <div className="sticky top-0 bg-gray-800 p-2 border-b border-gray-700">
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full bg-gray-700 rounded-md py-1 px-3 pl-8 text-white"
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  </div>
                </div>
                
                {isLoadingList ? (
                  <div className="p-4 text-center">Chargement...</div>
                ) : filteredCryptoList.length === 0 ? (
                  <div className="p-4 text-center">Aucun résultat</div>
                ) : (
                  filteredCryptoList.map((crypto: { id: string; symbol: string; name: string; image: string; current_price: number; market_cap_rank: number; price_change_percentage_24h: number }) => (
                    <div
                      key={crypto.id}
                      className={`p-2 hover:bg-gray-700 cursor-pointer flex items-center justify-between ${selectedCrypto === crypto.id ? 'bg-gray-700' : ''}`}
                      onClick={() => handleSelectCrypto(crypto.id)}
                    >
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-2 w-6 text-center">#{crypto.market_cap_rank}</span>
                        <img src={crypto.image} alt={crypto.symbol} className="w-5 h-5 mr-2" />
                        <span>{crypto.name}</span>
                        <span className="ml-2 text-gray-400 text-xs">{crypto.symbol}</span>
                      </div>
                      <div className={crypto.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {crypto.price_change_percentage_24h?.toFixed(1)}%
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          
          <select 
            className="bg-gray-800 text-white px-3 py-1 rounded border border-gray-700"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          
          <select 
            className="bg-gray-800 text-white px-3 py-1 rounded border border-gray-700"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {currencyOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          
          <select 
            className="bg-gray-800 text-white px-3 py-1 rounded border border-gray-700"
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
          >
            <option value="line">Ligne</option>
            <option value="area">Zone</option>
          </select>
        </div>
      </div>
      
      {/* Graphique */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700" style={{ height: '400px' }}>
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center text-red-500">
            {error}
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#ccc' }} 
                  axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                  tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                  minTickGap={30}
                />
                <YAxis 
                  tick={{ fill: '#ccc' }} 
                  domain={['auto', 'auto']}
                  axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                  tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                  tickFormatter={formatCurrency}
                  orientation="right"
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-gray-800 p-3 border border-gray-700 rounded shadow-lg">
                          <p className="text-gray-300 mb-1">{new Date(payload[0].payload.timestamp).toLocaleString()}</p>
                          <p className="font-semibold" style={{ color: trendColor }}>
                            {formatCurrency(payload[0].value)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke={trendColor} 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, fill: trendColor, stroke: 'white', strokeWidth: 2 }}
                />
              </LineChart>
            ) : (
              <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="gradientColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={trendColor} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={trendColor} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#ccc' }} 
                  axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                  tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                  minTickGap={30}
                />
                <YAxis 
                  tick={{ fill: '#ccc' }} 
                  domain={['auto', 'auto']}
                  axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                  tickLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                  tickFormatter={formatCurrency}
                  orientation="right"
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-gray-800 p-3 border border-gray-700 rounded shadow-lg">
                          <p className="text-gray-300 mb-1">{new Date(payload[0].payload.timestamp).toLocaleString()}</p>
                          <p className="font-semibold" style={{ color: trendColor }}>
                            {formatCurrency(payload[0].value)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke={trendColor} 
                  fill="url(#gradientColor)" 
                  strokeWidth={2}
                  activeDot={{ r: 6, fill: trendColor, stroke: 'white', strokeWidth: 2 }}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        ) : null}
      </div>
      
      {/* Boutons de zoom et d'autres fonctionnalités */}
      <div className="flex justify-center mt-4 space-x-2 flex-wrap gap-y-2">
        {timeRangeOptions.map(option => (
          <button
            key={option.value}
            className={`px-3 py-1 text-sm rounded ${timeRange === option.value 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            onClick={() => setTimeRange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CryptoGraph;