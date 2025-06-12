"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Award, Star, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { toast } from "sonner"; // or your preferred toast library
import { getCookie } from "cookies-next"; // Import getCookie from cookies-next

interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  category: string;
  coverImage: string;
  description: string;
  stock: number;
  quantity: number;
}

const categories = [
  {
    name: "Fiction",
    slug: "fiction",
    description:
      "Immerse yourself in captivating stories and imaginative worlds",
    bookCount: 1250,
    image:
      "https://plus.unsplash.com/premium_photo-1664006988924-16f386bcd40e?q=80&w=1973&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    color: "bg-blue-500",
  },
  {
    name: "Biography",
    slug: "biography",
    description: "Discover the lives of remarkable people throughout history",
    bookCount: 890,
    image:
      "https://images.unsplash.com/photo-1740512381140-5391ed336312?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8fHxlbnwwfHx8fHw%3D",
    color: "bg-green-500",
  },
  {
    name: "Programming",
    slug: "programming",
    description: "Learn coding, algorithms, and software development skills",
    bookCount: 675,
    image:
      "https://images.unsplash.com/photo-1484417894907-623942c8ee29?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    color: "bg-purple-500",
  },
  {
    name: "Philosophy",
    slug: "philosophy",
    description:
      "Explore fundamental questions about existence, knowledge, and values",
    bookCount: 543,
    image:
      "https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8UGhpbG9zb3BoeXxlbnwwfHwwfHx8MA%3D%3D",
    color: "bg-orange-500",
  },
  {
    name: "History",
    slug: "history",
    description: "Discover the events and people that shaped our world",
    bookCount: 432,
    image:
      "https://plus.unsplash.com/premium_photo-1682125784386-d6571f1ac86a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8SGlzdG9yeXxlbnwwfHwwfHx8MA%3D%3D",
    color: "bg-red-500",
  },
  {
    name: "Thriller",
    slug: "thriller",
    description: "Experience heart-pounding suspense and mystery",
    bookCount: 398,
    image:
      "https://images.unsplash.com/photo-1698956483970-a47edef29331?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8VGhyaWxsZXIlMjBib29rfGVufDB8fDB8fHww",
    color: "bg-gray-700",
  },
];

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cartItems, setCartItems] = useState<Book[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null); // State to store the access token

  // Effect to retrieve the access token from the cookie on component mount
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
    const fetchFeaturedBooks = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/books?limit=4`,
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setFeaturedBooks(data.data.books || []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch featured books:", err);
        setError("Failed to load featured books. Please try again later.");
        setFeaturedBooks([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedBooks();
  }, []);

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
          body: JSON.stringify({"items": [{ bookId: book.id, quantity: 1 }]}),
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

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price, 0);

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

      {/* Hero Section */}
      <section
        id="home"
        className="bg-gradient-to-r from-primary/10 to-primary/5 py-20"
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Your Next
            <span className="text-primary block">Great Read</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Explore thousands of books across all genres. From bestsellers to
            hidden gems, find your perfect book at BookHaven.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="text-lg px-8"
              onClick={() =>
                document.getElementById("featured")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
            >
              Browse Books
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8"
              onClick={() =>
                document.getElementById("categories")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
            >
              View Categories
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="flex justify-center">
                <div className="p-3 bg-primary/10 rounded-full">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-3xl font-bold">50K+</h3>
              <p className="text-muted-foreground">Books Available</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-3xl font-bold">100K+</h3>
              <p className="text-muted-foreground">Happy Readers</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Award className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-3xl font-bold">4.8/5</h3>
              <p className="text-muted-foreground">Customer Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section id="featured" className="py-16 scroll-mt-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Books</h2>
              <p className="text-muted-foreground">
                Handpicked selections from our editors
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/categories/all">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="bg-gray-200 h-48 rounded-md mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{error}</p>
            </div>
          ) : featuredBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredBooks.map((book) => (
                <Card
                  key={book.id}
                  className="group hover:shadow-lg transition-shadow h-full flex flex-col"
                >
                  <CardContent className="p-3 flex-1 flex flex-col">
                    <div className="relative mb-3 aspect-[2/3]">
                      <img
                        src={book.coverImage || "/placeholder.svg"}
                        alt={book.title}
                        className="w-full h-full object-cover rounded-md"
                      />
                      {book.originalPrice && (
                        <Badge className="absolute top-2 left-2 bg-rose-600 hover:bg-rose-700">
                          SALE
                        </Badge>
                      )}
                    </div>

                    <div className="flex-1 space-y-1 flex flex-col">
                      <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {book.author}
                      </p>

                      <div className="mt-auto pt-1">
                        <div className="flex items-center gap-1">
                          <span className="font-bold">${book.price}</span>
                          {book.originalPrice && (
                            <span className="text-xs text-muted-foreground line-through">
                              ${book.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="px-3 pb-3 pt-0">
                    <Button
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm h-8"
                      onClick={() => addToCart(book)}
                    >
                      Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No featured books available at the moment
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-16 bg-muted/30 scroll-mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Explore Categories</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Dive into our carefully curated categories and discover books that
              match your interests
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link key={category.slug} href={`/categories/${category.slug}`}>
                <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 border-0 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={category.image || "/placeholder.svg"}
                        alt={category.name}
                        className="w-full h-36 object-cover transition-all duration-500 group-hover:scale-105"
                      />
                      <div
                        className={`absolute inset-0 bg-gradient-to-t ${
                          category.color === "bg-gray-700"
                            ? "from-gray-900"
                            : "from-black"
                        } to-transparent opacity-70`}
                      />
                      <div className="absolute inset-0 flex flex-col items-start justify-end p-4">
                        <h3 className="text-white text-xl font-bold tracking-tight drop-shadow-md">
                          {category.name}
                        </h3>
                        <div className="w-10 h-1 bg-white mt-2 mb-3 rounded-full" />
                      </div>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-900">
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                        {category.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                          {category.bookCount}+ books
                        </span>
                        <button className="text-xs font-semibold text-white px-3 py-1 rounded-full bg-black dark:bg-white dark:text-black hover:opacity-90 transition-opacity">
                          Explore →
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}