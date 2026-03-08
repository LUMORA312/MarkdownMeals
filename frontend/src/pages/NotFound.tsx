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
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
          <Search className="w-10 h-10 text-muted-foreground/50" />
        </div>
        <h1 className="text-4xl font-display text-foreground">404</h1>
        <p className="text-lg text-muted-foreground font-body text-center max-w-xs">
          This page doesn't exist. Maybe the deal expired?
        </p>
        <div className="flex items-center gap-3 mt-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-muted text-foreground font-body font-medium cursor-pointer text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/')}
            className="px-5 py-2.5 rounded-full bg-accent text-accent-foreground font-body font-semibold cursor-pointer text-sm shadow-food"
          >
            Find Deals
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
