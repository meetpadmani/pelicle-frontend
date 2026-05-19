import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productsAPI } from '../services/api';
import ProductCard from '../components/product/ProductCard';
import SEO from '../components/common/SEO';
import { Search } from 'lucide-react';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(query);
  const [total, setTotal] = useState(0);

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await productsAPI.getAll({ keyword: q, limit: 24 });
      setResults(res.data.products);
      setTotal(res.data.totalProducts);
    } catch (_) {} finally { setLoading(false); }
  }, []);

  useEffect(() => { doSearch(query); }, [query, doSearch]);

  // Debounced live search
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput.trim() && searchInput !== query) {
        setSearchParams({ q: searchInput });
      }
    }, 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  const Skeleton = () => (
    <div className="animate-pulse">
      <div className="skeleton rounded-xl aspect-[3/4]" />
      <div className="mt-3 space-y-2"><div className="skeleton h-3 w-1/3 rounded" /><div className="skeleton h-4 w-full rounded" /></div>
    </div>
  );

  return (
    <div className="container-custom py-10 animate-fade-in">
      <SEO
        title={query ? `Search: ${query}` : 'Search Products'}
        description={`Search results for "${query}" at PELLICLE. Find the perfect fashion for you.`}
        noIndex
        url={`/search?q=${query}`}
      />
      <div className="max-w-xl mx-auto mb-10">
        <div className="flex items-center bg-white border-2 border-gray-200 focus-within:border-olive-green rounded-2xl overflow-hidden shadow-soft transition-all">
          <Search size={20} className="ml-4 text-gray-400 flex-shrink-0" />
          <input type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)}
            placeholder="Search clothes, brands, styles..."
            className="flex-1 px-4 py-4 text-base outline-none" id="search-page-input" />
        </div>
      </div>

      {query && (
        <div className="mb-6">
          <h1 className="text-xl font-bold text-deep-forest">
            {loading ? 'Searching...' : `${total} results for "${query}"`}
          </h1>
        </div>
      )}

      {!query && (
        <div className="text-center py-20">
          <Search size={64} className="mx-auto text-gray-200 mb-4" />
          <h2 className="text-xl font-semibold text-gray-400">Start typing to search</h2>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => <Skeleton key={i} />)}
        </div>
      ) : results.length === 0 && query ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">😕</p>
          <h2 className="text-xl font-semibold mb-2">No results found</h2>
          <p className="text-gray-500 mb-6">Try different keywords or browse our collections.</p>
          <Link to="/products" className="btn-primary inline-flex">Browse All Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {results.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
