import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import SEO from "../components/common/SEO";
import { 
    Shield, Truck, FileText, RefreshCcw, Users, 
    Mail, Phone, ChevronRight, Scroll as ScrollIcon 
} from 'lucide-react';

export default function PageView() {
    const { slug } = useParams();
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [sectionsData, setSectionsData] = useState([]);
    const [activeSection, setActiveSection] = useState('');

    useEffect(() => {
        setLoading(true);
        API.get(`/pages/${slug}`)
            .then(res => {
                if (res.data?.success) {
                    setPage(res.data.page);
                } else setNotFound(true);
            })
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false));
    }, [slug]);

    useEffect(() => {
        if (!page?.content) return;
        
        // Parse HTML content into sections based on Headings
        const parser = new DOMParser();
        const doc = parser.parseFromString(page.content, 'text/html');
        const elements = Array.from(doc.body.children);
        
        let currentSection = null;
        const parsedSections = [];
        
        elements.forEach((el, index) => {
            if (el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3') {
                if (currentSection) parsedSections.push(currentSection);
                const id = 'sec-' + index;
                // Add scroll padding to heading
                el.classList.add('scroll-mt-32');
                currentSection = { id, label: el.textContent, contentHTML: '' };
            } else {
                if (!currentSection) {
                    currentSection = { id: 'intro', label: 'Overview', contentHTML: '' };
                }
                currentSection.contentHTML += el.outerHTML;
            }
        });
        if (currentSection) parsedSections.push(currentSection);
        
        setSectionsData(parsedSections);
        if (parsedSections.length > 0) {
            setActiveSection(parsedSections[0].id);
        }
    }, [page]);

    useEffect(() => {
        if (loading || notFound || sectionsData.length === 0) return;
        window.scrollTo(0, 0);

        const handleScroll = () => {
            const sectionElements = sectionsData.map(sec => document.getElementById(sec.id));
            let current = '';

            sectionElements.forEach(section => {
                if (section) {
                    const sectionTop = section.offsetTop;       
                    if (window.scrollY >= sectionTop - 250) {
                        current = section.id;
                    }
                }
            });
            if (current) setActiveSection(current);
        };

        window.addEventListener('scroll', handleScroll);
        // Trigger once to set initial state correctly if scrolled
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [sectionsData, loading, notFound]);

    if (loading) return <LoadingSpinner />;

    if (notFound) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-warm-ivory px-4 font-body">
                <h1 className="text-4xl font-heading font-bold text-deep-forest mb-3">Page Not Found</h1>
                <p className="text-sage-green mb-6">The page you're looking for doesn't exist or has been removed.</p>
                <Link to="/" className="px-6 py-3 bg-deep-forest text-warm-ivory font-bold rounded-xl hover:bg-jet-black transition-all shadow-brand">
                    Return to Home
                </Link>
            </div>
        );
    }

    // Determine Icon based on slug
    const getHeroIcon = () => {
        if (!slug) return FileText;
        if (slug.includes('privacy')) return Shield;
        if (slug.includes('shipping')) return Truck;
        if (slug.includes('return') || slug.includes('refund')) return RefreshCcw;
        if (slug.includes('about')) return Users;
        return FileText;
    };
    const HeroIcon = getHeroIcon();

    // Assets - Fallbacks to solid colors if images don't exist
    const parchmentBg = "url('/images-webp/homepage/parchment-bg.webp')";
    const heroBg = "url('/images-webp/privacy-scroll-bg.webp')";
    const mandalaBg = "url('/images-webp/homepage/mandala-bg.webp')";

    return (
        <div className="bg-warm-ivory min-h-screen font-body text-charcoal/80 selection:bg-sandalwood/30 selection:text-deep-forest">
            <SEO
                title={`${page.title} | Pelicle`}
                description={page.metaDescription || `Read our ${page.title}.`}
                keywords={page.metaKeywords || ""}
                breadcrumbs={[
                    { name: "Home", url: "/" },
                    { name: page.title, url: `/pages/${slug}` }
                ]}
            />

            {/* --- HERO SECTION --- */}
            <div className="relative w-full pt-28 md:pt-36 pb-20 px-6 border-b border-sandalwood/30 overflow-hidden bg-warm-ivory">
                <div
                    className="absolute inset-0 z-0 pointer-events-none"
                    style={{
                        backgroundImage: heroBg,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: 0.2
                    }}
                />
                <div className="absolute inset-0 z-0 bg-gradient-to-b from-warm-ivory/95 via-warm-ivory/80 to-warm-ivory pointer-events-none"></div>

                <div className="relative z-10 max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center p-4 mb-6 bg-white/80 backdrop-blur-sm rounded-full shadow-[0_4px_20px_rgba(201,165,90,0.2)] ring-1 ring-sandalwood/40">
                        <HeroIcon className="w-8 h-8 md:w-10 md:h-10 text-sandalwood" />
                    </div>

                    <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-deep-forest mb-6 tracking-tight leading-tight drop-shadow-sm">
                        {page.title}
                    </h1>

                    {page.metaDescription && (
                        <p className="text-lg md:text-xl text-sage-green font-light max-w-2xl mx-auto leading-relaxed">
                            {page.metaDescription}
                        </p>
                    )}

                    <div className="mt-8 inline-flex items-center gap-2 px-6 py-2 rounded-full bg-light-beige border border-sandalwood/30 text-sage-green text-xs font-bold uppercase tracking-widest shadow-sm font-heading">
                        <ScrollIcon className="w-3 h-3 text-sandalwood" />
                        Last Updated: {new Date(page.updatedAt || Date.now()).toLocaleDateString("en-IN", { month: "long", year: "numeric", day: "numeric" })}
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="relative max-w-7xl 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
                <div
                    className="absolute inset-0 pointer-events-none opacity-20 z-0 mix-blend-multiply"
                    style={{ backgroundImage: parchmentBg, backgroundSize: 'cover', backgroundAttachment: 'fixed' }}
                />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 2xl:gap-16">
                    {/* --- LEFT SIDEBAR (Desktop) --- */}
                    {sectionsData.length > 1 && (
                        <div className="hidden lg:block lg:col-span-3">
                            <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-sandalwood/50 scrollbar-track-transparent">
                                <h3 className="text-xs font-bold text-sage-green uppercase tracking-wider mb-4 px-3 font-heading border-b border-sandalwood/20 pb-2">
                                    Table of Contents
                                </h3>
                                <nav className="space-y-1">
                                    {sectionsData.map((section) => (
                                        <a
                                            key={section.id}
                                            href={`#${section.id}`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                                                setActiveSection(section.id);
                                            }}
                                            className={`group flex items-center justify-between px-4 py-3 rounded-lg border-l-4 transition-all duration-300 ${activeSection === section.id
                                                    ? 'bg-white border-sandalwood text-deep-forest font-bold shadow-sm translate-x-1'
                                                    : 'border-transparent text-sage-green hover:bg-light-beige hover:text-deep-forest hover:border-sandalwood/30'
                                                }`}
                                        >
                                            <span className="text-sm truncate font-heading">{section.label}</span>
                                            {activeSection === section.id && <ChevronRight className="w-4 h-4 text-sandalwood" />}
                                        </a>
                                    ))}
                                </nav>
                            </div>
                        </div>
                    )}

                    {/* --- MOBILE/TABLET NAV --- */}
                    {sectionsData.length > 1 && (
                        <div className="lg:hidden col-span-1 sticky top-20 z-40 bg-warm-ivory/95 backdrop-blur-md border-b border-sandalwood/20 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 overflow-x-auto scrollbar-hide shadow-sm">
                            <div className="flex gap-3">
                                {sectionsData.map((section) => (
                                    <a
                                        key={section.id}
                                        href={`#${section.id}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                                            setActiveSection(section.id);
                                        }}
                                        className={`whitespace-nowrap text-sm px-5 py-2 rounded-full transition-all border font-heading font-bold ${activeSection === section.id
                                                ? 'bg-deep-forest text-warm-ivory border-deep-forest shadow-md'
                                                : 'bg-white text-sage-green border-sandalwood/30'
                                            }`}
                                    >
                                        {section.label}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* --- RIGHT CONTENT BODY --- */}
                    <div className={sectionsData.length > 1 ? "lg:col-span-9 space-y-12 lg:space-y-16 pb-24" : "lg:col-span-12 max-w-4xl mx-auto w-full space-y-12 lg:space-y-16 pb-24"}>
                        {sectionsData.length > 0 ? sectionsData.map((section) => (
                            <section key={section.id} id={section.id} className="scroll-mt-32">
                                <div className="bg-white/90 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-sandalwood/20 shadow-soft">
                                    {section.label !== 'Overview' && (
                                        <h2 className="font-heading text-2xl md:text-3xl font-bold text-deep-forest mb-6 border-b border-sandalwood/20 pb-4">
                                            {section.label}
                                        </h2>
                                    )}
                                    <div 
                                        className="prose prose-slate max-w-none text-charcoal/80 leading-relaxed
                                            prose-p:text-lg prose-p:mb-6
                                            prose-a:text-sandalwood prose-a:no-underline hover:prose-a:underline
                                            prose-strong:text-deep-forest prose-strong:font-bold
                                            prose-ul:text-charcoal/80 prose-ul:list-disc prose-ul:pl-5 marker:text-sandalwood
                                            prose-li:mb-2
                                            prose-img:rounded-xl prose-img:shadow-sm"
                                        dangerouslySetInnerHTML={{ __html: section.contentHTML }}
                                    />
                                </div>
                            </section>
                        )) : (
                            <section className="scroll-mt-32">
                                <div className="bg-white/90 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-sandalwood/20 shadow-soft">
                                    <div 
                                        className="prose prose-slate max-w-none text-charcoal/80 leading-relaxed
                                            prose-p:text-lg prose-p:mb-6
                                            prose-a:text-sandalwood prose-a:no-underline hover:prose-a:underline
                                            prose-strong:text-deep-forest prose-strong:font-bold
                                            prose-ul:text-charcoal/80 prose-ul:list-disc prose-ul:pl-5 marker:text-sandalwood
                                            prose-li:mb-2
                                            prose-h1:font-heading prose-h1:text-3xl prose-h1:text-deep-forest prose-h1:mb-6 prose-h1:border-b prose-h1:border-sandalwood/20 prose-h1:pb-4
                                            prose-h2:font-heading prose-h2:text-2xl prose-h2:text-deep-forest prose-h2:mb-4 prose-h2:mt-12 prose-h2:border-b prose-h2:border-sandalwood/20 prose-h2:pb-3
                                            prose-h3:font-heading prose-h3:text-xl prose-h3:text-deep-forest prose-h3:mb-3 prose-h3:mt-8"
                                        dangerouslySetInnerHTML={{ __html: page.content }}
                                    />
                                </div>
                            </section>
                        )}

                        {/* Contact Section */}
                        <section id="contact" className="scroll-mt-32">
                            <div className="bg-gradient-to-br from-deep-forest to-jet-black text-warm-ivory p-10 md:p-14 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                                <div className="absolute inset-0 opacity-5 pointer-events-none"
                                    style={{ backgroundImage: mandalaBg, backgroundSize: '300px', backgroundRepeat: 'repeat' }}></div>

                                <div className="relative z-10 text-center">
                                    <h2 className="font-heading text-2xl md:text-4xl font-bold mb-6 flex items-center justify-center gap-3 text-warm-ivory">
                                        <Mail className="w-8 h-8 text-sandalwood" />
                                        Contact Us
                                    </h2>
                                    <p className="text-sandalwood mb-10 text-lg">
                                        Questions about our {page.title}? We are here to listen.
                                    </p>

                                    <div className="flex flex-col sm:flex-row justify-center gap-6 text-base font-medium">
                                        <span className="flex items-center gap-3 justify-center bg-white/10 px-6 py-3 rounded-full border border-sandalwood/30 hover:bg-sandalwood/20 transition-colors">
                                            <Mail className="w-5 h-5 text-sandalwood" /> support@pelicle.com
                                        </span>
                                        <span className="flex items-center gap-3 justify-center bg-white/10 px-6 py-3 rounded-full border border-sandalwood/30 hover:bg-sandalwood/20 transition-colors">
                                            <Phone className="w-5 h-5 text-sandalwood" /> +91 90818 03195
                                        </span>
                                    </div>
                                    <p className="text-sage-green text-sm mt-8 border-t border-sandalwood/20 pt-6 inline-block px-10">
                                        Mon-Sat, 10:00 AM - 6:00 PM IST
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

        </div>
    );
}
