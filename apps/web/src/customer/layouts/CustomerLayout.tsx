import { Outlet, Link } from 'react-router-dom';
import { LocationSelector } from '../../shared/components/LocationSelector';
import { CartDrawer } from '../../shared/components/CartDrawer';

export function CustomerLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container flex h-16 items-center px-8">
          <Link to="/" className="font-extrabold text-2xl tracking-tight text-primary mr-8">
            FoodieGo
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link to="/" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Home
            </Link>
            <Link to="/search" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Search
            </Link>
          </nav>
          <div className="ml-auto flex items-center space-x-4">
            <LocationSelector />
            <Link to="/admin" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Restaurant Portal
            </Link>
            <div className="border-l h-6 mx-2 border-border" />
            <CartDrawer />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with modern architecture.
          </p>
        </div>
      </footer>
    </div>
  );
}
