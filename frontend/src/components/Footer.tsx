import { UtensilsCrossed } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="relative z-10 w-full overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

      <div className="bg-gradient-to-b from-foreground/5 to-foreground/10 pt-10 sm:pt-14 pb-6 sm:pb-8">
        <div className="max-w-3xl mx-auto px-6">
          {/* Top section: brand + columns */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 sm:gap-12 mb-8 sm:mb-10">
            {/* Brand */}
            <div className="flex flex-col items-center sm:items-start gap-3 flex-1">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-accent shadow-sm">
                  <UtensilsCrossed className="w-5 h-5 text-accent-foreground" />
                </div>
                <span className="text-2xl font-display text-foreground">FoodMan</span>
              </div>
              <div className="text-base font-body font-bold text-foreground/80 text-center sm:text-left leading-relaxed">
                <p className="whitespace-nowrap">Discover the best food markdowns near you.</p>
                <p className="whitespace-nowrap">Save more, eat better.</p>
              </div>
            </div>

            {/* Link columns */}
            <div className="flex gap-12 sm:gap-16">
              <div className="flex flex-col gap-2.5">
                <span className="text-sm font-body font-bold text-foreground/90 uppercase tracking-widest mb-1">Explore</span>
                <Link to="/restaurants" className="text-base font-body font-semibold text-foreground/80 hover:text-accent cursor-pointer transition-colors">Browse Deals</Link>
                <Link to="/restaurants" className="text-base font-body font-semibold text-foreground/80 hover:text-accent cursor-pointer transition-colors">Top Rated</Link>
                <Link to="/restaurants" className="text-base font-body font-semibold text-foreground/80 hover:text-accent cursor-pointer transition-colors">Near Me</Link>
              </div>
              <div className="flex flex-col gap-2.5">
                <span className="text-sm font-body font-bold text-foreground/90 uppercase tracking-widest mb-1">Company</span>
                <span className="text-base font-body font-semibold text-foreground/80 hover:text-accent cursor-pointer transition-colors">About</span>
                <span className="text-base font-body font-semibold text-foreground/80 hover:text-accent cursor-pointer transition-colors">Contact</span>
                <span className="text-base font-body font-semibold text-foreground/80 hover:text-accent cursor-pointer transition-colors">Privacy</span>
              </div>
              <div className="flex flex-col gap-2.5">
                <span className="text-sm font-body font-bold text-foreground/90 uppercase tracking-widest mb-1">Portal</span>
                <Link to="/partner/login" className="text-base font-body font-semibold text-foreground/80 hover:text-accent cursor-pointer transition-colors">Partner Login</Link>
                <Link to="/admin/login" className="text-base font-body font-semibold text-foreground/80 hover:text-accent cursor-pointer transition-colors">Admin Login</Link>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-5 sm:mb-6" />

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm font-body font-bold text-foreground/70">
              &copy; {new Date().getFullYear()} FoodMan. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
