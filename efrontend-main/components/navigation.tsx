"use client";
import Link from "next/link";
import { Search, ShoppingCart, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter, // Added SheetFooter for checkout button
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, // Added Select components
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label"; // Added Label
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // Ensure toast is imported
import { getCookie } from "cookies-next"; // Import getCookie for client-side cookie access

// Assuming this Book interface is consistent with HomePage's Book interface
interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  reviews?: number;
  category?: string;
  coverImage: string; // Ensure this is the correct property name for the image
  description?: string;
  inStock?: boolean;
  quantity?: number; // Added quantity for cart items
}

interface NavigationProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  cartItems: Book[]; // Changed from any[] to Book[] for better typing
  cartTotal: number;
  // FIX: Ensure this type matches HomePage's async function signature
  removeFromCart: (id: string) => Promise<void>;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  // Assuming accessToken is passed from HomePage now
  accessToken: string | null;
}

const paymentMethods = ["credit_card", "paypal", "cash_on_delivery"];
const ethiopianCities = [
  "Addis Ababa",
  "Adama (Nazret)",
  "Gondar",
  "Mekelle",
  "Dire Dawa",
  "Hawassa",
  "Bahir Dar",
  "Dessie",
  "Jimma",
  "Shashemene",
  "Harar",
  "Debre Markos",
  "Nekemte",
  "Debre Birhan",
  "Awasa", // Often used interchangeably with Hawassa, but sometimes distinct. Added for completeness.
];

export function Navigation({
  searchTerm,
  setSearchTerm,
  cartItems,
  cartTotal,
  removeFromCart,
  isCartOpen,
  setIsCartOpen,
  accessToken, // Receive accessToken as prop
}: NavigationProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<
    { email: string; name?: string } | null
  >(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | null
  >(null);
  const [selectedShippingAddress, setSelectedShippingAddress] = useState<
    string | null
  >(null);
  const router = useRouter();

  useEffect(() => {
    // We are now passing accessToken as a prop,
    // so we don't strictly need to fetch it from cookie here again.
    // However, the user data parsing from localStorage is still relevant.
    const checkAuth = () => {
      const user = localStorage.getItem("user");
      if (accessToken && user) {
        setIsLoggedIn(true);
        try {
          setUserData(JSON.parse(user));
        } catch (e) {
          console.error("Failed to parse user data from localStorage", e);
        }
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    };

    checkAuth();
    // Listen for storage changes if user data might change elsewhere
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, [accessToken]); // Re-run if accessToken prop changes

  const handleLogin = () => {
    router.push("/login");
  };

  const handleLogout = () => {
    // Clear accessToken cookie
    document.cookie =
      "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserData(null);
    toast.success("Logged out successfully!");
    router.push("/");
  };

  const handleProceedToCheckout = async () => {
    if (!isLoggedIn) {
      toast.error("Please log in to proceed with your order.");
      setIsCartOpen(false); // Close cart for login redirect
      router.push("/login");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty. Please add items before checking out.");
      return;
    }

    if (!selectedPaymentMethod) {
      toast.error("Please select a payment method.");
      return;
    }

    if (!selectedShippingAddress) {
      toast.error("Please select a shipping address.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            paymentMethod: selectedPaymentMethod,
            shippingAddress: selectedShippingAddress,
            // Assuming cart items are processed on the backend from user's session/cart state,
            // or you might send a list of book IDs and quantities here if backend needs it.
            // For now, based on instructions, only paymentMethod and shippingAddress are explicit.
            // If the backend needs item details, you'd add:
            // items: cartItems.map(item => ({ bookId: item.id, quantity: item.quantity || 1 })),
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create order.");
      }

      const orderData = await response.json();
      console.log("Order created successfully:", orderData);
      toast.success("Order placed successfully!");
      // Clear cart items after successful order
      // You would typically have a function passed down from HomePage to clear cart
      // For demonstration, let's just close the cart and reset selections
      setIsCartOpen(false);
      // You might also trigger a global cart clear or refresh the cart state from backend
      // For now, simulating clearing by resetting local state (will be re-fetched on next login/page load)
      // removeFromCart is not designed for clearing all, so we can't use it directly here.
      // A prop like `clearCart: () => void` from HomePage would be ideal.
      setSelectedPaymentMethod(null);
      setSelectedShippingAddress(null);
      // Optionally, navigate to an order confirmation page
      // router.push(`/order-confirmation/${orderData.orderId}`);
    } catch (err: any) {
      console.error("Error creating order:", err.message);
      toast.error(`Order failed: ${err.message}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 md:space-x-8">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>

            <Link href="/" className="flex items-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary"
              >
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
              <h1 className="text-2xl font-bold text-primary">BookHaven</h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Home
              </Link>
              <Link
                href="/#featured"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Featured
              </Link>
              <Link
                href="/#categories"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Categories
              </Link>
            </nav>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search books, authors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItems.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary">
                      {cartItems.length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="flex flex-col">
                <SheetHeader className="border-b pb-4">
                  <SheetTitle className="text-xl font-bold">Your Cart</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto py-4">
                  {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
                      <p className="text-sm text-muted-foreground">
                        Start shopping to add items to your cart
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cartItems.map((item, index) => (
                        <div
                          key={`${item.id}-${index}`}
                          className="flex items-start gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <img
                            src={item.coverImage || "/placeholder.svg"} // Changed from item.cover to item.coverImage
                            alt={item.title}
                            className="w-16 h-20 object-cover rounded-md"
                          />
                          <div className="flex-1 min-w-0 space-y-1">
                            <h4 className="font-medium text-sm line-clamp-2">
                              {item.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {item.author}
                            </p>
                            <p className="font-semibold text-primary">
                              ${item.price}
                            </p>
                            {item.quantity && item.quantity > 1 && (
                              <p className="text-xs text-muted-foreground">
                                Qty: {item.quantity}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Payment and Shipping Selection */}
                {cartItems.length > 0 && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <Label htmlFor="paymentMethod" className="mb-2 block">
                        Payment Method
                      </Label>
                      <Select
                        onValueChange={setSelectedPaymentMethod}
                        value={selectedPaymentMethod || ""}
                      >
                        <SelectTrigger id="paymentMethod">
                          <SelectValue placeholder="Select a payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods.map((method) => (
                            <SelectItem key={method} value={method}>
                              {method}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="shippingAddress" className="mb-2 block">
                        Shipping Address
                      </Label>
                      <Select
                        onValueChange={setSelectedShippingAddress}
                        value={selectedShippingAddress || ""}
                      >
                        <SelectTrigger id="shippingAddress">
                          <SelectValue placeholder="Select a city" />
                        </SelectTrigger>
                        <SelectContent>
                          {ethiopianCities.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                <SheetFooter className="border-t pt-4 space-y-4">
                  {cartItems.length > 0 && (
                    <>
                      <div className="flex justify-between items-center text-lg font-bold mb-4">
                        <span>Total:</span>
                        <span>${cartTotal.toFixed(2)}</span>
                      </div>
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleProceedToCheckout}
                      >
                        Proceed to Checkout
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        Free shipping on orders over $50
                      </p>
                    </>
                  )}
                </SheetFooter>
              </SheetContent>
            </Sheet>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                {isLoggedIn && userData ? (
                  <>
                    <div className="px-2 py-1.5">
                      {userData.name && (
                        <p className="text-sm font-medium">{userData.name}</p>
                      )}
                      <p className="text-xs text-muted-foreground truncate">
                        {userData.email}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      Log out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={handleLogin}>
                      Login
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/register">Sign Up</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Search - Always visible */}
        <div className="mt-4 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search books, authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t">
            <nav className="flex flex-col space-y-3">
              <Link
                href="/"
                className="text-sm font-medium hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/#featured"
                className="text-sm font-medium hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Featured
              </Link>
              <Link
                href="/#categories"
                className="text-sm font-medium hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Categories
              </Link>
              {isLoggedIn ? (
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  Logout
                </Button>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium hover:text-primary transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm font-medium hover:text-primary transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up</Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}