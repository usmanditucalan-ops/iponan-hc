import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { Check, Calendar, Shield, Heart } from 'lucide-react';

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#facc15" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-transparent font-sans text-slate-900 overflow-x-hidden">
      {/* ── Navbar ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-shadow duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 font-bold text-lg text-slate-900">
            <img src={logo} alt="Logo" className="w-8 h-8 rounded-sm" />
            Barangay Iponan Health Clinic
          </Link>

          {/* Desktop Nav Links */}
          <ul className="hidden md:flex items-center gap-8 font-medium text-sm text-slate-600">
            <li><a href="#features" className="hover:text-slate-900 transition-colors">Features</a></li>
            <li><a href="#testimonial" className="hover:text-slate-900 transition-colors">Testimonials</a></li>
            <li><a href="#contact" className="hover:text-slate-900 transition-colors">Contact</a></li>
          </ul>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <Link to="/login" className="text-slate-700 hover:text-slate-900 transition-colors">
              Log In
            </Link>
            <Link to="/register" className="bg-[#b721ff] bg-gradient-to-r from-[#b721ff] to-[#f426c1] text-white px-6 py-2.5 rounded-full shadow hover:opacity-90 transition-opacity">
              Sign Up
            </Link>
          </div>

          {/* Mobile Hamburger (Basic) */}
          <button 
            className="md:hidden p-2 text-slate-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 right-0 bg-white shadow-lg border-t border-slate-100 flex flex-col p-6 gap-4">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="font-medium text-slate-600">Features</a>
            <a href="#testimonial" onClick={() => setMobileMenuOpen(false)} className="font-medium text-slate-600">Testimonials</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="font-medium text-slate-600">Contact</a>
            <hr className="my-2 border-slate-100" />
            <Link to="/login" className="font-medium text-slate-700 text-center py-2" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
            <Link to="/register" className="bg-[#b721ff] bg-gradient-to-r from-[#b721ff] to-[#f426c1] text-white font-semibold py-3 rounded-md text-center" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
          </div>
        )}
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-6 overflow-hidden">
        {/* Subtle Gradient Mesh Background matching screenshot */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-[#e0f2fe] via-[#fdf4ff] to-transparent opacity-60 rounded-full blur-[100px] -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#e0f2fe] via-[#faf5ff] to-transparent opacity-50 rounded-full blur-[100px] -z-10 -translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="max-w-xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#f4e8ff] text-[#b721ff] font-semibold text-xs tracking-wide px-4 py-2 rounded-full mb-8">
              <Shield size={14} className="text-[#b721ff]" />
              Trusted by Our Community
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-[56px] leading-[1.1] font-[900] text-slate-900 tracking-tight mb-6">
              Efficient Healthcare <br />
              for Our <span className="text-[#00bcd4]">Community.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-slate-500 mb-10 leading-relaxed font-medium">
              Book Appointments, Access EMR, and Manage Health Records Securely — all in one modern platform built for Barangay Iponan.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-16">
              <Link to="/login" className="px-8 py-3.5 bg-white text-slate-800 font-bold border border-slate-200 rounded-md hover:bg-slate-50 transition-colors shadow-sm text-sm">
                Log In
              </Link>
              <Link to="/register" className="px-8 py-3.5 bg-gradient-to-r from-[#b721ff] to-[#f426c1] text-white font-bold rounded-md shadow-lg hover:shadow-xl hover:opacity-90 transition-all text-sm flex items-center gap-2">
                Sign Up Free <span>→</span>
              </Link>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-10 border-t border-slate-200 pt-8">
              <div>
                <h4 className="text-2xl font-[900] text-slate-900">1,200+</h4>
                <p className="text-xs text-slate-500 font-semibold mt-1">Patients Served</p>
              </div>
              <div>
                <h4 className="text-2xl font-[900] text-slate-900">98%</h4>
                <p className="text-xs text-slate-500 font-semibold mt-1">Satisfaction Rate</p>
              </div>
              <div>
                <h4 className="text-2xl font-[900] text-slate-900">24/7</h4>
                <p className="text-xs text-slate-500 font-semibold mt-1">Digital Access</p>
              </div>
            </div>
          </div>

          {/* Right side illustration block */}
          <div className="relative">
             <div className="relative z-10 bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] rounded-[1.5rem] p-10 shadow-2xl overflow-hidden aspect-square border border-white max-w-lg ml-auto flex items-center justify-center">
                 {/* This represents the abstract clinic building from the screenshot */}
                 <div className="w-[85%] h-[85%] bg-white rounded-md shadow-sm border border-slate-100 flex flex-col p-4 relative">
                    <div className="flex gap-4 p-4 border-b border-slate-100">
                        <div className="w-10 h-10 rounded bg-teal-50 flex items-center justify-center"><Calendar size={20} className="text-teal-500" /></div>
                        <div>
                            <div className="h-3 w-20 bg-slate-200 rounded-full mb-2"></div>
                            <div className="h-2 w-32 bg-slate-100 rounded-full"></div>
                        </div>
                    </div>
                    <div className="p-4 flex-1">
                        <div className="h-2 w-full bg-slate-100 rounded-full mb-3"></div>
                        <div className="h-2 w-[80%] bg-slate-100 rounded-full mb-3"></div>
                        <div className="h-2 w-[90%] bg-slate-100 rounded-full mb-3"></div>
                        <div className="h-2 w-[70%] bg-slate-100 rounded-full mb-5"></div>
                        <div className="grid grid-cols-2 gap-3 mt-auto">
                            <div className="h-10 bg-[#f4e8ff] rounded"></div>
                            <div className="h-10 bg-teal-50 rounded"></div>
                        </div>
                    </div>

                    {/* Floating 'Easy Booking' element matching the screenshot */}
                    <div className="absolute -top-4 -right-10 bg-white rounded-md shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] p-4 flex items-center gap-3 border border-slate-50 animate-[landing-float_3s_ease-in-out_infinite_alternate]">
                       <div className="w-10 h-10 rounded bg-[#e0f2fe] flex items-center justify-center">
                         <Calendar size={18} className="text-[#0ea5e9]"/>
                       </div>
                       <div>
                         <p className="text-sm font-bold text-slate-800">Easy Booking</p>
                         <p className="text-[10px] font-medium text-slate-400 mt-0.5">Schedule in seconds</p>
                       </div>
                    </div>

                    {/* Floating 'Secure Records' element matching screenshot */}
                    <div className="absolute -bottom-6 -left-12 bg-white rounded-md shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] p-4 flex items-center gap-3 border border-slate-50 animate-[landing-float_3s_ease-in-out_infinite_alternate_reverse]">
                       <div className="w-10 h-10 rounded bg-[#f4e8ff] flex items-center justify-center">
                         <Shield size={18} className="text-[#a855f7]"/>
                       </div>
                       <div>
                         <p className="text-sm font-bold text-slate-800">Secure Records</p>
                         <p className="text-[10px] font-medium text-slate-400 mt-0.5">HIPAA-grade security</p>
                       </div>
                    </div>
                 </div>
                 {/* Decorative background circle */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-cyan-400/5 to-purple-400/5 rounded-full -z-10 blur-xl"></div>
             </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="py-24 px-6 bg-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-[#f4e8ff] text-[#b721ff] font-bold text-xs tracking-widest uppercase px-4 py-1.5 rounded-full mb-6">
              ✦ Features
            </div>
            <h2 className="text-3xl md:text-5xl font-[900] text-slate-900 mb-6 tracking-tight">Everything Your Community Clinic Needs</h2>
            <p className="text-lg text-slate-500 font-medium">
              Modern tools designed to simplify healthcare delivery and empower patients with digital access.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-[1.5rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all duration-300 group border border-slate-100/50 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#00bcd4] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-16 h-16 rounded-lg bg-[#ecfeff] flex items-center justify-center mb-6">
                <Calendar size={28} className="text-[#00bcd4]" />
              </div>
              <h3 className="text-xl font-[800] text-slate-900 mb-4">Easy Appointments</h3>
              <p className="text-slate-500 leading-relaxed font-medium text-[15px]">
                Book clinic appointments with just a few clicks. View available slots, choose your preferred time, and receive instant confirmation.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-[1.5rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all duration-300 group border border-slate-100/50 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#b721ff] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-16 h-16 rounded-lg bg-[#f4e8ff] flex items-center justify-center mb-6">
                <Shield size={28} className="text-[#b721ff]" />
              </div>
              <h3 className="text-xl font-[800] text-slate-900 mb-4">Secure EMR</h3>
              <p className="text-slate-500 leading-relaxed font-medium text-[15px]">
                Access and manage Electronic Medical Records securely. Patient data is encrypted and protected with industry-standard security.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-[1.5rem] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all duration-300 group border border-slate-100/50 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-[#f426c1] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-16 h-16 rounded-lg bg-[#fdf2f8] flex items-center justify-center mb-6">
                <Heart size={28} className="text-[#f426c1]" />
              </div>
              <h3 className="text-xl font-[800] text-slate-900 mb-4">Community Health</h3>
              <p className="text-slate-500 leading-relaxed font-medium text-[15px]">
                Promote inclusive community health programs, track immunizations, manage prenatal care, and support barangay-level wellness initiatives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonial Section ── */}
      <section id="testimonial" className="py-24 px-6 bg-[#fcfcfd]">
        <div className="max-w-5xl mx-auto bg-white rounded-[1.75rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-50 overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Left Graphic Block */}
            <div className="bg-[#f0f9f9] p-12 flex items-center justify-center relative overflow-hidden">
               <div className="w-[80%] aspect-square bg-white/60 backdrop-blur-sm rounded-xl shadow-sm border border-white flex items-center justify-center relative">
                  {/* Decorative sprinkles */}
                  <div className="absolute top-10 left-10 w-2 h-2 rounded-full bg-cyan-300"></div>
                  <div className="absolute bottom-20 right-10 w-2 h-2 rounded-full bg-purple-300"></div>
                  <div className="absolute top-20 right-16 text-pink-200">✦</div>
                  <div className="absolute bottom-16 left-16 text-cyan-200">✦</div>
                  
                  {/* Avatar graphic from screenshot */}
                  <div className="w-32 h-32 rounded-full bg-blue-100 flex flex-col items-center justify-end overflow-hidden border-4 border-white shadow-xl relative z-10">
                     <div className="w-14 h-14 rounded-full bg-amber-600 mb-1 border-[3px] border-amber-800 shadow-inner relative flex items-center justify-center">
                         <div className="w-6 h-3 border-b-2 border-amber-900 rounded-b-full translate-y-2"></div>
                         {/* Eyes */}
                         <div className="w-1.5 h-1.5 rounded-full bg-amber-900 absolute left-3 top-5"></div>
                         <div className="w-1.5 h-1.5 rounded-full bg-amber-900 absolute right-3 top-5"></div>
                     </div>
                     <div className="w-24 h-16 bg-blue-300 rounded-t-full mt-1"></div>
                  </div>
               </div>
            </div>

            {/* Right Content Block */}
            <div className="p-12 md:p-16 flex flex-col justify-center">
              <div className="w-12 h-12 bg-gradient-to-tr from-[#b721ff] to-[#f426c1] rounded-lg flex items-center justify-center mb-10 shadow-lg shadow-purple-500/20">
                <span className="text-white text-3xl font-serif leading-none mt-2">"</span>
              </div>
              
              <p className="text-xl md:text-[22px] leading-[1.8] text-slate-700 font-medium mb-12">
                Thank you to this amazing system. It has completely changed how I manage my family's health appointments. Booking is so easy, and I love that I can view my medical records anytime. The staff at Barangay Iponan Health Clinic truly care for their patients' quality of care.
              </p>

              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#b721ff] to-[#f426c1] flex items-center justify-center text-white font-bold text-xl shadow-md">
                  SN
                </div>
                <div>
                  <h4 className="font-[800] text-slate-900 text-[17px]">Sean Nelson</h4>
                  <p className="text-slate-500 font-medium text-sm mt-0.5 mb-2">Patient • Brgy. Iponan Resident</p>
                  <div className="flex gap-1">
                    <StarIcon /><StarIcon /><StarIcon /><StarIcon /><StarIcon />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-24 px-6 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto bg-gradient-to-r from-[#00bcd4] via-[#3b82f6] via-[#a855f7] to-[#f426c1] rounded-[2rem] p-16 md:p-24 text-center relative overflow-hidden shadow-2xl">
          {/* Subtle light overlay on gradient */}
          <div className="absolute top-[-50%] left-[-10%] w-[120%] h-[200%] bg-[radial-gradient(ellipse,rgba(255,255,255,0.15)_0%,transparent_60%)] pointer-events-none"></div>

          <h2 className="text-4xl md:text-5xl lg:text-[56px] font-[900] text-white mb-6 tracking-tight relative z-10 drop-shadow-sm">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 font-medium max-w-2xl mx-auto mb-12 relative z-10 leading-relaxed">
            Join hundreds of families in Barangay Iponan who trust our clinic for their healthcare needs.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 relative z-10">
            <Link to="/register" className="w-full sm:w-auto px-10 py-4 bg-white text-[#a855f7] font-bold rounded-lg shadow-xl shadow-black/10 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
              Create Free Account
            </Link>
            <Link to="/login" className="w-full sm:w-auto px-10 py-4 bg-white/20 backdrop-blur-md text-white border-2 border-white/30 font-bold rounded-lg hover:bg-white/30 transition-all duration-300">
              Log In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer id="contact" className="bg-[#0f172a] pt-24 pb-10 px-6 mt-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-20 border-b border-slate-800 pb-20">
          
          {/* Brand Col */}
          <div className="md:col-span-5">
             <div className="flex items-center gap-3 font-bold text-xl text-white mb-6">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-400 to-purple-500 p-[1px]">
                  <img src={logo} alt="Logo" className="w-full h-full rounded-sm object-cover bg-white" />
                </div>
                Barangay Iponan Health Clinic
            </div>
            <p className="text-slate-400 leading-relaxed max-w-sm font-medium">
              Providing quality, accessible healthcare services to the community of Barangay Iponan, Cagayan de Oro City.
            </p>
          </div>

          {/* Links Col 1 */}
          <div className="md:col-span-3">
             <h4 className="text-white font-[800] text-sm mb-6 tracking-wide">Company</h4>
             <ul className="flex flex-col gap-4 text-slate-400 font-medium">
               <li><a href="#features" className="hover:text-cyan-400 transition-colors">Features</a></li>
               <li><a href="#testimonial" className="hover:text-cyan-400 transition-colors">Testimonials</a></li>
               <li><a href="#contact" className="hover:text-cyan-400 transition-colors">Contact</a></li>
             </ul>
          </div>

          {/* Links Col 2 */}
          <div className="md:col-span-2">
             <h4 className="text-white font-[800] text-sm mb-6 tracking-wide">Quick Links</h4>
             <ul className="flex flex-col gap-4 text-slate-400 font-medium">
               <li><Link to="/login" className="hover:text-purple-400 transition-colors">Login</Link></li>
               <li><Link to="/register" className="hover:text-purple-400 transition-colors">Sign Up</Link></li>
             </ul>
          </div>

          {/* Socials Col */}
          <div className="md:col-span-2">
             {/* No social links requested, padding column for symmetry or could add generic ones */}
             <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-md bg-slate-800/50 border border-slate-700 flex items-center justify-center text-slate-400 hover:bg-gradient-to-br hover:from-cyan-500 hover:to-purple-500 hover:text-white hover:border-transparent transition-all">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-md bg-slate-800/50 border border-slate-700 flex items-center justify-center text-slate-400 hover:bg-gradient-to-br hover:from-cyan-500 hover:to-purple-500 hover:text-white hover:border-transparent transition-all">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-md bg-slate-800/50 border border-slate-700 flex items-center justify-center text-slate-400 hover:bg-gradient-to-br hover:from-cyan-500 hover:to-purple-500 hover:text-white hover:border-transparent transition-all">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
             </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-slate-500 text-sm font-medium">
          <p>© 2026 Barangay Iponan Health Clinic. All rights reserved.</p>
        </div>
      </footer>
      
      {/* ── Add the floating animation that Tailwind doesn't have by default ── */}
      <style>{`
        @keyframes landing-float {
          0% { transform: translateY(0); }
          100% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
