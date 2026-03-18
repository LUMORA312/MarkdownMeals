import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 gap-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ rotate: [0, -5, 5, -3, 0] }}
          transition={{ duration: 4, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center"
        >
          <Search className="w-10 h-10 text-muted-foreground/50" strokeWidth={2} />
        </motion.div>
        <h1 className="text-5xl font-display text-foreground">404</h1>
        <p className="text-lg text-muted-foreground font-body text-center max-w-xs">
          This page doesn't exist. Maybe the deal expired?
        </p>
        <div className="flex items-center gap-3 mt-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-amber-400 bg-amber-50 text-amber-700 font-body font-bold cursor-pointer text-sm hover:bg-amber-100 hover:border-amber-500 shadow-sm hover:shadow-md transition-all"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={3} />
            Go back
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate('/')}
            className="btn-shine btn-glow flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-accent via-accent/90 to-accent/70 text-accent-foreground font-body font-extrabold cursor-pointer text-sm tracking-wide"
          >
            <Search className="w-4 h-4" strokeWidth={3} />
            Find Deals
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
