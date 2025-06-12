import Link from "next/link"
import { BookOpen, Facebook, Twitter, Instagram, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">BookHaven</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your premier destination for books across all genres. Discover, explore, and immerse yourself in the world
              of literature.
            </p>
            <div className="flex space-x-2">
              <Button variant="outline" size="icon">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Instagram className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Quick Links</h3>
            <div className="space-y-2 text-sm">
              <Link href="/" className="block hover:text-primary transition-colors">
                Home
              </Link>
              <Link href="/categories/fiction" className="block hover:text-primary transition-colors">
                Fiction
              </Link>
              <Link href="/categories/self-help" className="block hover:text-primary transition-colors">
                Self-Help
              </Link>
              <Link href="/categories/business" className="block hover:text-primary transition-colors">
                Business
              </Link>
              <Link href="/categories/biography" className="block hover:text-primary transition-colors">
                Biography
              </Link>
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="font-semibold">Customer Service</h3>
            <div className="space-y-2 text-sm">
              <Link href="#" className="block hover:text-primary transition-colors">
                Contact Us
              </Link>
              <Link href="#" className="block hover:text-primary transition-colors">
                FAQ
              </Link>
              <Link href="#" className="block hover:text-primary transition-colors">
                Shipping Info
              </Link>
              <Link href="#" className="block hover:text-primary transition-colors">
                Returns
              </Link>
              <Link href="#" className="block hover:text-primary transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold">Stay Updated</h3>
            <p className="text-sm text-muted-foreground">
              Subscribe to our newsletter for the latest book releases and exclusive offers.
            </p>
            <div className="flex space-x-2">
              <Input placeholder="Enter your email" className="flex-1" />
              <Button>
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 BookHaven. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
