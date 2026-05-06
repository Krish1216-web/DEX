import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center pt-20 px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
          <p className="text-xl text-foreground font-semibold mb-2">
            Page Not Found
          </p>
        </div>

        <p className="text-muted-foreground mb-8">
          Oops! The page you're looking for doesn't exist. This route is coming soon or may have been removed.
        </p>

        <Link to="/">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            <Home className="w-4 h-4" />
            Return to Home
          </Button>
        </Link>

        <p className="text-xs text-muted-foreground mt-8">
          Requested path: <span className="text-accent font-mono">{location.pathname}</span>
        </p>
      </div>
    </div>
  );
};

export default NotFound;
