import { Stethoscope, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-professional-navy text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="medical-gradient p-2 rounded-xl">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">SwiftCare</span>
            </div>
            <p className="text-white/80 mb-6 leading-relaxed">
              Revolutionary dental practice management system designed for the modern clinic. 
              Streamline operations, enhance patient care, and grow your practice.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 smooth-transition">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 smooth-transition">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 smooth-transition">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 smooth-transition">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/features" className="text-white/80 hover:text-white smooth-transition">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-white/80 hover:text-white smooth-transition">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/demo" className="text-white/80 hover:text-white smooth-transition">
                  Live Demo
                </Link>
              </li>
              <li>
                <Link to="/integrations" className="text-white/80 hover:text-white smooth-transition">
                  Integrations
                </Link>
              </li>
              <li>
                <Link to="/security" className="text-white/80 hover:text-white smooth-transition">
                  Security
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Support</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/help" className="text-white/80 hover:text-white smooth-transition">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/docs" className="text-white/80 hover:text-white smooth-transition">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/training" className="text-white/80 hover:text-white smooth-transition">
                  Training
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-white/80 hover:text-white smooth-transition">
                  Community
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white/80 hover:text-white smooth-transition">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-dental-mint-light" />
                <span className="text-white/80">hello@swiftcare.com</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-dental-mint-light" />
                <span className="text-white/80">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-dental-mint-light mt-1" />
                <span className="text-white/80">
                  123 Healthcare Blvd<br />
                  Medical District, CA 90210
                </span>
              </li>
            </ul>
            
            {/* Newsletter Signup */}
            <div className="mt-8">
              <h4 className="font-semibold mb-3">Stay Updated</h4>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-l-lg text-white placeholder-white/60 focus:outline-none focus:border-dental-mint"
                />
                <button className="px-4 py-2 dental-gradient rounded-r-lg hover:opacity-90 smooth-transition">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-white/80 text-sm mb-4 md:mb-0">
              © 2024 SwiftCare Dental System. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy" className="text-white/80 hover:text-white smooth-transition">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-white/80 hover:text-white smooth-transition">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-white/80 hover:text-white smooth-transition">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;