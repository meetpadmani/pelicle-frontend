import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist } from '../../features/wishlist/wishlistSlice';
import ProductCard from '../../components/product/ProductCard';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyWishlist = () => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector(s => s.wishlist);

  useEffect(() => { document.title = 'Wishlist — PELLICLE'; dispatch(fetchWishlist()); }, [dispatch]);

  return (
    <div className="container-custom py-10 animate-fade-in">
      <div className="flex items-center gap-2 mb-8">
        <Link to="/dashboard" className="text-sm text-gray-500 hover:text-olive-green">Account</Link><span className="text-gray-400">/</span>
        <span className="text-sm font-semibold text-deep-forest">Wishlist</span>
      </div>
      <h1 className="text-2xl font-bold text-deep-forest mb-6 flex items-center gap-2"><Heart className="text-red-500" /> My Wishlist</h1>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">{[...Array(4)].map((_, i) => <div key={i} className="skeleton rounded-xl aspect-[3/4]" />)}</div>
      ) : products.length === 0 ? (
        <div className="card p-12 text-center">
          <Heart size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">Save items you love to review them later.</p>
          <Link to="/products" className="btn-primary inline-flex">Explore Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {products.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
};
export default MyWishlist;
