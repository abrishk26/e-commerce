"use client";

import React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Edit, Trash2, Star, LayoutDashboard, BookOpen, ShoppingCart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { getCookie } from 'cookies-next';

interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  isbn?: string;
  description?: string;
  publicationDate?: string;
  pageCount?: number | null;
  genres?: string[];
  stock?: number;
  coverImage?: string;
  originalPrice?: number;
  rating?: number;
  reviews?: number;
}

interface BookFormData {
  title: string;
  author: string;
  price: string;
  isbn: string;
  description: string;
  publicationDate: string;
  pageCount: string;
  genres: string[];
  stock: string;
  coverImage: string;
  originalPrice: string;
}

const sidebarItems = [
  { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { title: "Books", href: "/admin/books", icon: BookOpen },
  { title: "Orders", href: "/admin/orders", icon: ShoppingCart },
];

function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-muted/40">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/admin" className="flex items-center space-x-2">
          <LayoutDashboard className="h-6 w-6" />
          <span className="font-semibold">Admin Panel</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {sidebarItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </Link>
        ))}
      </nav>
      <div className="border-t p-4">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Store
        </Link>
      </div>
    </div>
  );
}

const BookForm = React.memo(({ formData, setFormData, onSubmit, submitText, genresList }: {
  formData: BookFormData;
  setFormData: React.Dispatch<React.SetStateAction<BookFormData>>;
  onSubmit: () => void;
  submitText: string;
  genresList: string[];
}) => (
  <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="author">Author</Label>
        <Input
          id="author"
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          required
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="isbn">ISBN</Label>
        <Input
          id="isbn"
          value={formData.isbn}
          onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
          placeholder="e.g., 978-3-16-148410-0"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="price">Price</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          min="0"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          required
        />
      </div>
    </div>

    <div className="grid grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label htmlFor="originalPrice">Original Price</Label>
        <Input
          id="originalPrice"
          type="number"
          step="0.01"
          min="0"
          value={formData.originalPrice}
          onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="publicationDate">Publication Date</Label>
        <Input
          id="publicationDate"
          type="date"
          value={formData.publicationDate}
          onChange={(e) => setFormData({ ...formData, publicationDate: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pageCount">Page Count</Label>
        <Input
          id="pageCount"
          type="number"
          min="1"
          value={formData.pageCount}
          onChange={(e) => setFormData({ ...formData, pageCount: e.target.value })}
        />
      </div>
    </div>

    <div className="space-y-2">
      <Label htmlFor="genres">Genres</Label>
      <Select
        value={formData.genres[0] || ''}
        onValueChange={(value) => setFormData({ ...formData, genres: value ? [value] : [] })}
      >
        <SelectTrigger id="genres">
          <SelectValue placeholder="Select genre" />
        </SelectTrigger>
        <SelectContent>
          {genresList.map((genre) => (
            <SelectItem key={genre} value={genre}>
              {genre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div className="space-y-2">
      <Label htmlFor="stock">Stock</Label>
      <Input
        id="stock"
        type="number"
        min="0"
        value={formData.stock}
        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
        required
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="coverImage">Cover Image URL</Label>
      <Input
        id="coverImage"
        value={formData.coverImage}
        onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
        placeholder="/placeholder.svg?height=300&width=200"
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="description">Description</Label>
      <Textarea
        id="description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        rows={3}
      />
    </div>

    <DialogFooter>
      <Button type="submit">{submitText}</Button>
    </DialogFooter>
  </form>
));

const genresList = ["Fiction", "Self-Help", "Business", "Biography", "History", "Thriller", "Science", "Fantasy", "Mystery", "Programming", "Philosophy"];

export default function BooksManagement() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState<BookFormData>({
    title: "",
    author: "",
    price: "",
    isbn: "",
    description: "",
    publicationDate: "",
    pageCount: "",
    genres: [],
    stock: "0",
    coverImage: "",
    originalPrice: "",
  });

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getCookie('accessToken')}`
  });

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/books`, {
          headers: getAuthHeaders()
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        setBooks(data.data?.books || []);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch books:", err);
        setError(err.message || "Failed to load books");
        setBooks([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const resetForm = () => setFormData({
    title: "",
    author: "",
    price: "",
    isbn: "",
    description: "",
    publicationDate: "",
    pageCount: "",
    genres: [],
    stock: "0",
    coverImage: "",
    originalPrice: "",
  });

  const handleAddBook = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/books`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: formData.title,
          author: formData.author,
          price: Number(formData.price) || 0,
          isbn: formData.isbn,
          description: formData.description,
          publicationDate: formData.publicationDate,
          pageCount: Number(formData.pageCount) || null,
          genres: formData.genres.length > 0 ? formData.genres : ['Unknown'],
          stock: Number(formData.stock) || 0,
          coverImage: formData.coverImage || "/placeholder.svg",
          originalPrice: Number(formData.originalPrice) || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add book");
      }

      const { data } = await response.json();
      
      setBooks(prev => [...prev, {
        id: data.id,
        title: data.title || "Untitled",
        author: data.author || "Unknown",
        price: data.price || 0,
        isbn: data.isbn,
        description: data.description,
        publicationDate: data.publicationDate,
        pageCount: data.pageCount,
        genres: data.genres || [],
        stock: data.stock || 0,
        coverImage: data.coverImage || "/placeholder.svg",
        originalPrice: data.originalPrice,
        rating: data.rating || 0,
        reviews: data.reviews || 0,
      }]);

      setIsAddDialogOpen(false);
      resetForm();
      toast.success("Book added successfully");
    } catch (error: any) {
      console.error("Error adding book:", error);
      toast.error(error.message || "Failed to add book");
    }
  };

  const handleEditBook = async () => {
    if (!editingBook) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/books/${editingBook.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: formData.title,
          author: formData.author,
          price: Number(formData.price) || 0,
          isbn: formData.isbn,
          description: formData.description,
          publicationDate: formData.publicationDate,
          pageCount: Number(formData.pageCount) || null,
          genres: formData.genres.length > 0 ? formData.genres : ['Unknown'],
          stock: Number(formData.stock) || 0,
          coverImage: formData.coverImage || "/placeholder.svg",
          originalPrice: Number(formData.originalPrice) || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update book");
      }

      const { data } = await response.json();
      
      setBooks(prev => prev.map(book => 
        book.id === editingBook.id ? {
          ...book,
          ...data,
          price: data.price || 0,
          stock: data.stock || 0
        } : book
      ));
      
      setIsEditDialogOpen(false);
      setEditingBook(null);
      resetForm();
      toast.success("Book updated successfully");
    } catch (error: any) {
      console.error("Error updating book:", error);
      toast.error(error.message || "Failed to update book");
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (!confirm("Are you sure you want to delete this book?")) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/books/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error("Failed to delete book");

      setBooks(prev => prev.filter(book => book.id !== id));
      toast.success("Book deleted successfully");
    } catch (error: any) {
      console.error("Error deleting book:", error);
      toast.error(error.message || "Failed to delete book");
    }
  };

  const openEditDialog = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      price: book.price.toString(),
      originalPrice: book.originalPrice?.toString() || "",
      isbn: book.isbn || "",
      description: book.description || "",
      publicationDate: book.publicationDate ? new Date(book.publicationDate).toISOString().split('T')[0] : "",
      pageCount: book.pageCount?.toString() || "",
      genres: book.genres || [],
      stock: book.stock?.toString() || "0",
      coverImage: book.coverImage || "",
    });
    setIsEditDialogOpen(true);
  };

  const renderContent = () => {
    if (isLoading) return (
      <div className="grid gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex gap-6">
                <Skeleton className="w-24 h-32 rounded-md" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );

    if (error) return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-medium">Unable to load books</h3>
          <p className="text-muted-foreground">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );

    if (books.length === 0) return (
      <div className="flex flex-col items-center justify-center py-12">
        <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
        <div className="text-center space-y-2">
          <h3 className="text-lg font-medium">No books available</h3>
          <p className="text-muted-foreground">Your book inventory is empty. Add your first book!</p>
          <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Book
          </Button>
        </div>
      </div>
    );

    return (
      <div className="grid gap-6">
        {books.map((book) => (
          <Card key={book.id}>
            <CardContent className="p-6">
              <div className="flex gap-6">
                <img
                  src={book.coverImage || "/placeholder.svg"}
                  alt={book.title}
                  className="w-24 h-32 object-cover rounded-md"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold">{book.title}</h3>
                      <p className="text-muted-foreground">{book.author}</p>
                      <p className="text-sm text-muted-foreground">ID: {book.id}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(book)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteBook(book.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 flex-wrap gap-2">
                    {book.genres?.map((genre) => (
                      <Badge key={genre} variant="secondary">{genre}</Badge>
                    ))}
                    {book.rating !== undefined && book.reviews !== undefined && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">
                          {book.rating} ({book.reviews} reviews)
                        </span>
                      </div>
                    )}
                    <Badge variant={(book.stock || 0) > 0 ? "default" : "destructive"}>
                      {(book.stock || 0) > 0 ? `In Stock (${book.stock})` : "Out of Stock"}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">{book.description}</p>
                  <p className="text-sm text-muted-foreground">Pages: {book.pageCount || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">
                    Published: {book.publicationDate ? new Date(book.publicationDate).toLocaleDateString() : 'N/A'}
                  </p>

                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold">${book.price.toFixed(2)}</span>
                    {book.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        ${book.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-screen">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <Sheet>
        <div className="flex flex-col flex-1">
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 md:hidden">
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <h1 className="font-semibold">Books Management</h1>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold">Books Management</h1>
                  <p className="text-muted-foreground">Manage your book inventory</p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetForm}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Book
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Book</DialogTitle>
                      <DialogDescription>Add a new book to your inventory</DialogDescription>
                    </DialogHeader>
                    <BookForm
                      formData={formData}
                      setFormData={setFormData}
                      onSubmit={handleAddBook}
                      submitText="Add Book"
                      genresList={genresList}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              {renderContent()}

              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Edit Book</DialogTitle>
                    <DialogDescription>Update book information</DialogDescription>
                  </DialogHeader>
                  <BookForm
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleEditBook}
                    submitText="Update Book"
                    genresList={genresList}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </main>
        </div>
        <SheetContent side="left" className="p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>
    </div>
  );
}