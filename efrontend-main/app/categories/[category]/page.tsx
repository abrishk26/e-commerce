"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { Star, Frown } from "lucide-react" // Added Frown icon for error/no data states
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Skeleton } from "@/components/ui/skeleton" // Assuming you have a Skeleton component for loading
import { toast } from "sonner"; // or your preferred toast library
import { getCookie } from "cookies-next"; // Import getCookie from cookies-next

interface Book {
  id: string
  title: string
  author: string
  price: number
  originalPrice?: number
  rating: number
  reviews: number
  category: string // This will map to genre in your API
  coverImage: string
  description: string
  stock: number
  quantity: number
}

// categoryInfo remains the same as it's static UI data for display purposes
const categoryInfo = {
  fiction: {
    title: "Fiction",
    description: "Immerse yourself in captivating stories and imaginative worlds",
  },
  "self-help": {
    title: "Self-Help",
    description: "Transform your life with practical guidance and inspiration",
  },
  business: {
    title: "Business",
    description: "Master the art of business and entrepreneurship",
  },
  biography: {
    title: "Biography",
    description: "Discover the lives of remarkable people throughout history",
  },
  history: {
    title: "History",
    description: "Explore the events that shaped our world",
  },
  thriller: {
    title: "Thriller",
    description: "Experience heart-pounding suspense and mystery",
  },
  all: { // Added an 'all' category for consistency
    title: "All Books",
    description: "Browse our entire collection of books across all genres",
  }
}

export default function CategoryPage() {
  const params = useParams()
  const category = params.category as string // e.g., "fiction", "self-help", "all"

  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("featured")
  const [cartItems, setCartItems] = useState<Book[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null); 

  // State for fetched books
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  useEffect(() => {
    // getCookie works on the client-side when rendered in a 'use client' component
    const token = getCookie("accessToken");
    if (token) {
      setAccessToken(token.toString()); // getCookie returns a string | undefined
      console.log("Access Token retrieved from cookie:", token);
    } else {
      console.warn("Access Token not found in cookie with key 'accessToken'.");
      // Depending on your auth flow, you might want to redirect to login
      // router.push('/login');
    }
  }, []); // Empty dependency array means this runs once on mount
  useEffect(() => {
    const fetchBooksByCategory = async () => {
      setLoading(true);
      setError(null);
      setBooks([]); // Clear previous books

      if (!API_BASE_URL) {
        setError("API Base URL is not configured. Please check NEXT_PUBLIC_API_BASE_URL in .env.local");
        setLoading(false);
        return;
      }

      let url = `${API_BASE_URL}/v1/books`;

      // Construct genre query parameter based on the category
      if (category && category !== "all") {
        // Assuming your API supports ?genres=fiction for single or ?genres[]=fiction&genres[]=thriller
        // For simplicity, we'll use a single genre parameter for now based on the route param
        url += `?genres=${category}`;
      }
      // If category is "all", we fetch all books without a genre filter.

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch books: ${response.statusText}`);
        }
        const data = await response.json();
        // Ensure data is an array of books, or handle different API response structures
        if (Array.isArray(data.data.books)) {
          setBooks(data.data.books);
        } else if (data.data.books && Array.isArray(data.data.books)) { // If API returns an object with a 'books' array
            setBooks(data.data.books);
        }
        else {
          setBooks([]); // No books or unexpected format
        }
      } catch (err: any) {
        console.error("Error fetching books:", err);
        setError(err.message || "An unexpected error occurred while fetching books.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooksByCategory();
  }, [category, API_BASE_URL]); // Re-fetch when category or API_BASE_URL changes

  // Use useMemo to re-sort books only when 'books' or 'sortBy' changes
  const sortedBooks = useMemo(() => {
    // Start with a copy of the fetched books
    const booksToSort = [...books];

    switch (sortBy) {
      case "price-low":
        return booksToSort.sort((a, b) => a.price - b.price);
      case "price-high":
        return booksToSort.sort((a, b) => b.price - a.price);
      case "rating":
        return booksToSort.sort((a, b) => b.rating - a.rating);
      case "title":
        return booksToSort.sort((a, b) => a.title.localeCompare(b.title));
      case "featured":
      default:
        // For 'featured' or default, maintain original order from API or apply a custom logic if available
        // If your API has a 'featured' flag or returns them in a specific order for 'featured', you might use that.
        // For now, it will simply keep the order received from the API.
        return booksToSort;
    }
  }, [books, sortBy]);

  const categoryData = categoryInfo[category as keyof typeof categoryInfo] || {
    title: "Unknown Category",
    description: "Explore books in this category.",
  }

  const addToCart = async (book: Book) => {
    if (!accessToken) {
      toast.error("You need to be logged in to add items to the cart.");
      // Optionally, if not logged in, redirect to the login page:
      // router.push('/login');
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/cart`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`, // Use the retrieved accessToken
          },
          body: JSON.stringify({"items" : [{ bookId: book.id, quantity: 1 }]}),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add book to cart");
      }

      setCartItems((prev) => {
        const existingItem = prev.find((item) => item.id === book.id);
        if (existingItem) {
          // If the book is already in the cart, update its quantity
          return prev.map((item) =>
            item.id === book.id
              ? { ...item, quantity: (item.quantity || 1) + 1 }
              : item,
          );
        }
        // If it's a new book, add it with quantity 1
        return [...prev, { ...book, quantity: 1 }];
      });
      toast.success(`${book.title} added to cart`);
    } catch (err: any) {
      console.error("Error adding to cart:", err.message);
      toast.error(`Failed to add ${book.title} to cart: ${err.message}`);
    }
  };

  const removeFromCart = async (bookId: string) => {
    if (!accessToken) {
      toast.error("You need to be logged in to modify your cart.");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/cart`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`, // Use the retrieved accessToken
          },
          body: JSON.stringify({ items: [{ bookId: bookId, quantity: 1 }] }), // Removing 1 quantity
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to remove book from cart");
      }

      setCartItems((prev) => {
        const existingItem = prev.find((item) => item.id === bookId);
        if (existingItem && (existingItem.quantity || 1) > 1) {
          // If multiple quantities, just decrement
          return prev.map((item) =>
            item.id === bookId
              ? { ...item, quantity: (item.quantity || 1) - 1 }
              : item,
          );
        }
        // If only one quantity or not found, remove completely
        return prev.filter((item) => item.id !== bookId);
      });
      toast.info("Book removed from cart");
    } catch (err: any) {
      console.error("Error removing from cart:", err.message);
      toast.error(`Failed to remove book from cart: ${err.message}`);
    }
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price, 0)

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        cartItems={cartItems}
        cartTotal={cartTotal}
        removeFromCart={removeFromCart}
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        accessToken={accessToken}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Category Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{categoryData.title}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{categoryData.description}</p>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <p className="text-muted-foreground">
              {loading ? "Loading..." : `${sortedBooks.length} books found`}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Conditional Rendering based on loading, error, and data presence */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => ( // Show 8 skeleton cards while loading
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="w-full h-48 rounded-md mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <Frown className="mx-auto h-12 w-12 text-destructive mb-4" />
            <p className="text-lg text-destructive">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        )}

        {!loading && !error && sortedBooks.length === 0 && (
          <div className="text-center py-12">
            <Frown className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">No books found in this category.</p>
            <Button variant="outline" className="mt-4" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        )}

        {/* Books Grid - Render only if not loading, no error, and books exist */}
        {!loading && !error && sortedBooks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedBooks.map((book) => (
              <Card key={book.id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="relative mb-4">
                    <img
                      src={book.coverImage || "/placeholder.svg"}
                      alt={book.title}
                      className="w-full h-48 object-cover rounded-md"
                    />
                    {book.originalPrice && <Badge className="absolute top-2 left-2 bg-red-500">Sale</Badge>}
                    {(book.stock < 1) && (
                      <Badge variant="secondary" className="absolute top-2 right-2">
                        Out of Stock
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{book.author}</p>

                    <div className="flex items-center space-x-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < Math.floor(book.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">({book.reviews})</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-lg">${book.price}</span>
                      {book.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">${book.originalPrice}</span>
                      )}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-0">
                  <Button className="w-full" onClick={() => addToCart(book)} disabled={book.stock < 1}>
                    {(book.stock > 0) ? "Add to Cart" : "Out of Stock"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}