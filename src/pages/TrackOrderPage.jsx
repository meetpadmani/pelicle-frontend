import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import SEO from '../components/common/SEO';
import { fetchFeatured } from '../features/products/productsSlice';
import ProductCard from '../components/product/ProductCard';
import { CheckCircle2, Circle } from 'lucide-react';

const TrackOrderPage = () => {
  const dispatch = useDispatch();
  const { featured } = useSelector(s => s.products);
  
  const [trackingMethod, setTrackingMethod] = useState('orderId');
  const [trackingValue, setTrackingValue] = useState('');

  useEffect(() => {
    dispatch(fetchFeatured());
  }, [dispatch]);

  const handleTrack = (e) => {
    e.preventDefault();
    // Simulate tracking or just prevent default for UI purposes
    console.log(`Tracking by ${trackingMethod}: ${trackingValue}`);
  };

  const ProductSkeleton = () => (
    <div className="animate-pulse">
      <div className="bg-gray-200 rounded-xl aspect-[3/4]" />
      <div className="mt-3 space-y-2">
        <div className="bg-gray-200 h-3 w-1/3 rounded" />
        <div className="bg-gray-200 h-4 w-full rounded" />
        <div className="bg-gray-200 h-4 w-2/3 rounded" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDF8EB] font-body animate-fade-in pb-16">
      <SEO title="Track Your Order | Pelicle" description="Track the status of your Pelicle order." url="/track-order" />
      
      {/* Main Tracking Section */}
      <div className="container-custom py-12 lg:py-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Tracking Card */}
          <div className="bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-gray-100 flex flex-col justify-center">
            <h1 className="text-3xl font-heading font-bold text-deep-forest mb-2">Track Your Order</h1>
            <p className="text-gray-500 mb-8 text-sm">Enter your tracking details below to get real-time updates on your package.</p>
            
            <form onSubmit={handleTrack}>
              {/* Radio Selection */}
              <div className="flex items-center gap-6 mb-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" name="trackingMethod" className="hidden" 
                    checked={trackingMethod === 'orderId'} 
                    onChange={() => setTrackingMethod('orderId')} 
                  />
                  {trackingMethod === 'orderId' ? (
                    <CheckCircle2 className="text-deep-forest" size={20} />
                  ) : (
                    <Circle className="text-gray-300 group-hover:text-gray-400" size={20} />
                  )}
                  <span className={`font-semibold ${trackingMethod === 'orderId' ? 'text-deep-forest' : 'text-gray-500'}`}>Order ID</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="radio" name="trackingMethod" className="hidden" 
                    checked={trackingMethod === 'trackingId'} 
                    onChange={() => setTrackingMethod('trackingId')} 
                  />
                  {trackingMethod === 'trackingId' ? (
                    <CheckCircle2 className="text-deep-forest" size={20} />
                  ) : (
                    <Circle className="text-gray-300 group-hover:text-gray-400" size={20} />
                  )}
                  <span className={`font-semibold ${trackingMethod === 'trackingId' ? 'text-deep-forest' : 'text-gray-500'}`}>Tracking ID</span>
                </label>
              </div>

              {/* Integrated Input and Button */}
              <div className="relative flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:border-deep-forest focus-within:ring-1 focus-within:ring-deep-forest transition-all bg-white">
                <input 
                  type="text" 
                  className="flex-1 py-4 px-4 bg-transparent outline-none text-gray-800 placeholder:text-gray-400"
                  placeholder={trackingMethod === 'orderId' ? 'Enter Order ID (e.g. #12345)' : 'Enter Tracking ID / AWB'}
                  value={trackingValue}
                  onChange={e => setTrackingValue(e.target.value)}
                  required
                />
                <button 
                  type="submit" 
                  className="bg-gray-100 hover:bg-gray-200 text-deep-forest font-bold px-6 py-4 transition-colors whitespace-nowrap h-full border-l border-gray-200"
                >
                  Track Your Order
                </button>
              </div>
            </form>
          </div>

          {/* Promotional Image */}
          <div className="hidden lg:block relative rounded-2xl overflow-hidden shadow-sm h-[400px]">
            <img 
              src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=80" 
              alt="Promotional Banner" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-8">
              <div className="text-white">
                <p className="font-heading font-bold text-2xl mb-1">Premium Quality</p>
                <p className="text-sm text-white/80">Experience luxury with every wear.</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Best Sellers / Featured Section */}
      <div className="container-custom mt-8">
        <h2 className="text-2xl font-heading font-bold text-deep-forest mb-6">Shop Our Best Sellers</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {featured.length > 0
            ? featured.slice(0, 5).map(p => <ProductCard key={p._id} product={p} />)
            : [...Array(5)].map((_, i) => <ProductSkeleton key={i} />)
          }
        </div>
      </div>
    </div>
  );
};

export default TrackOrderPage;
