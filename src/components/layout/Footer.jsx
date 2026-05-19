import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Youtube, Mail, Phone, MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <>
      <footer style={{ background: 'linear-gradient(180deg, #0a2218 0%, #061510 100%)', borderTop: '1px solid rgba(201,165,90,0.15)', color: '#f0ede7', position: 'relative', overflow: 'hidden' }}>
        {/* Subtle gold vignette top edge */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,165,90,0.5), transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '40%', height: 80, background: 'radial-gradient(ellipse, rgba(201,165,90,0.06) 0%, transparent 70%)', filter: 'blur(20px)', pointerEvents: 'none' }} />

        <div className="container-custom py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            
            {/* 1. Brand Info */}
            <div>
              <Link to="/" className="inline-block mb-6">
                <img
                  src="/assets/pelicle-logo.png"
                  alt="Pelicle"
                  style={{ height: 48, width: 'auto', filter: 'brightness(0) saturate(100%) invert(87%) sepia(22%) saturate(200%) hue-rotate(10deg) brightness(100%)' }}
                />
              </Link>
              <p style={{ color: 'rgba(240,237,231,0.6)', fontSize: 14, lineHeight: 1.8, marginBottom: 24, fontWeight: 300, letterSpacing: '0.03em' }}>
                India's premium fashion destination â€” curating the finest in streetwear and loungewear. Move Freely. Stay Stylish.
              </p>
              <div className="flex flex-col gap-3" style={{ fontSize: 14, color: 'rgba(240,237,231,0.7)' }}>
                <div className="flex items-center gap-2">
                  <Phone size={15} style={{ color: '#F1E9CB' }} /> +91 90818 03195
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={15} style={{ color: '#F1E9CB' }} /> support@pelicle.com
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ color: '#F1E9CB', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase' }}>Location:</span> Ahmedabad, Gujarat
                </div>
              </div>
            </div>

            {/* 2. Customer Links */}
            <div>
              <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 18, marginBottom: 24, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#F1E9CB' }}>Customer Care</h4>
              <ul className="space-y-4">
                {['Track Order', 'Returns & Exchanges', 'Shipping Info', 'Size Guide', 'FAQs'].map((item) => (
                  <li key={item}>
                    <Link to="#" style={{ color: 'rgba(240,237,231,0.6)', fontSize: 14, fontWeight: 300, letterSpacing: '0.05em', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.target.style.color = '#F1E9CB'}
                      onMouseLeave={e => e.target.style.color = 'rgba(240,237,231,0.6)'}
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Quick Links */}
            <div>
              <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 18, marginBottom: 24, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#F1E9CB' }}>Quick Links</h4>
              <ul className="space-y-4">
                {['Shop Men', 'Shop Women', 'New Arrivals', 'Our Story', 'Contact Us'].map((item) => (
                  <li key={item}>
                    <Link to="#" style={{ color: 'rgba(240,237,231,0.6)', fontSize: 14, fontWeight: 300, letterSpacing: '0.05em', textDecoration: 'none', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.target.style.color = '#F1E9CB'}
                      onMouseLeave={e => e.target.style.color = 'rgba(240,237,231,0.6)'}
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* 4. Social Icons */}
            <div>
              <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: 18, marginBottom: 24, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#F1E9CB' }}>Follow Us</h4>
              <p style={{ color: 'rgba(240,237,231,0.55)', fontSize: 14, marginBottom: 24, fontWeight: 300, lineHeight: 1.7 }}>
                Join our community on social media for daily styling inspiration.
              </p>
              <div className="flex items-center gap-4">
                {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                  <a key={i} href="#"
                    style={{ width: 40, height: 40, border: '1px solid rgba(201,165,90,0.25)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(240,237,231,0.7)', transition: 'all 0.3s', textDecoration: 'none' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#F1E9CB'; e.currentTarget.style.color = '#061510'; e.currentTarget.style.borderColor = '#F1E9CB'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(240,237,231,0.7)'; e.currentTarget.style.borderColor = 'rgba(201,165,90,0.25)'; }}
                  >
                    <Icon size={18} strokeWidth={1.5} />
                  </a>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* â”€â”€ Bottom â”€â”€ */}
        <div style={{ borderTop: '1px solid rgba(201,165,90,0.1)', background: 'rgba(0,0,0,0.3)' }}>
          <div className="container-custom py-6 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ fontSize: 11, color: 'rgba(240,237,231,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            <p>Â© {new Date().getFullYear()} PELICLE. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2"><span style={{ color: '#F1E9CB' }}>ðŸ”’</span> Secure Payments</span>
              <span className="flex items-center gap-2"><span style={{ color: '#F1E9CB' }}>ðŸšš</span> Free Shipping â‚¹999+</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;

