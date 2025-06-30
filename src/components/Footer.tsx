import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 mt-auto relative z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">DePrint</h3>
            <p className="text-muted-foreground">Your one-stop shop for high-quality printed products and designs.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-muted-foreground hover:text-primary">Home</Link></li>
              <li><Link href="/products" className="text-muted-foreground hover:text-primary">Products</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/privacy-policy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
              <li><Link href="/shipping-policy" className="text-muted-foreground hover:text-primary">Shipping Policy</Link></li>
              <li><Link href="/return-policy" className="text-muted-foreground hover:text-primary">Return Policy</Link></li>
            </ul>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} DePrint. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
} 