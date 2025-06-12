"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertCircle,
  BookOpen,
  CreditCard,
  Edit,
  LayoutDashboard,
  MapPin,
  Menu,
  Plus,
  ShoppingCart,
  Trash2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { getCookie } from "cookies-next";

// --- Interfaces ---
interface OrderItem {
  book: string; // Just the book ID
  quantity: number;
  id: string;
}

interface Order {
  id: string;
  user: string;
  items: OrderItem[];
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress: string;
  paymentMethod: string;
  createdAt?: string;
}

// --- Sidebar Component ---
const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Books",
    href: "/admin/books",
    icon: BookOpen,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
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
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Store
        </Link>
      </div>
    </div>
  );
}

// --- Main Component ---
const orderStatuses = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState({
    user: "",
    shippingAddress: "",
    paymentMethod: "",
    status: "pending" as Order["status"],
    items: [{ bookId: "", quantity: "" }],
  });

  const getAuthHeaders = () => {
    const accessToken = getCookie("accessToken");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    };
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/orders`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setOrders(data.data.orders);
    } catch (err: any) {
      console.error("Failed to fetch orders:", err);
      setError(err.message || "Failed to load orders");
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const resetForm = () => {
    setFormData({
      user: "",
      shippingAddress: "",
      paymentMethod: "",
      status: "pending",
      items: [{ bookId: "", quantity: "" }],
    });
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const addItemField = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { bookId: "", quantity: "" }],
    });
  };

  const removeItemField = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleAddEditOrder = async () => {
    try {
      const payload = {
        user: formData.user,
        items: formData.items.map((item) => ({
          book: item.bookId,
          quantity: Number(item.quantity),
        })),
        status: formData.status,
        shippingAddress: formData.shippingAddress,
        paymentMethod: formData.paymentMethod,
      };

      const url = editingOrder
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/orders/${editingOrder.id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/orders`;

      const method = editingOrder ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${editingOrder ? "update" : "create"} order`);
      }

      toast.success(`Order ${editingOrder ? "updated" : "created"} successfully!`);
      fetchOrders();
      setIsAddEditDialogOpen(false);
      setEditingOrder(null);
      resetForm();
    } catch (error) {
      console.error(`Error ${editingOrder ? "updating" : "creating"} order:`, error);
      toast.error(`Failed to ${editingOrder ? "update" : "create"} order`);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/orders/${id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete order");
      }

      toast.success("Order deleted successfully!");
      fetchOrders();
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order");
    }
  };

  const openAddDialog = () => {
    setEditingOrder(null);
    resetForm();
    setIsAddEditDialogOpen(true);
  };

  const openEditDialog = (order: Order) => {
    setEditingOrder(order);
    setFormData({
      user: order.user,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      status: order.status,
      items: order.items.map((item) => ({
        bookId: item.book,
        quantity: item.quantity.toString(),
      })),
    });
    setIsAddEditDialogOpen(true);
  };

  const formatPaymentMethod = (method: string) => {
    return method
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getStatusVariant = (status: Order["status"]) => {
    switch (status) {
      case "delivered":
        return "success";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid gap-6">
          {[...Array(3)].map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-56" />
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex justify-between items-center mt-4">
                  <Skeleton className="h-6 w-24" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-2">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h3 className="text-lg font-medium">Unable to load orders</h3>
            <p className="text-muted-foreground">{error}</p>
            <Button variant="outline" className="mt-4" onClick={fetchOrders}>
              Retry
            </Button>
          </div>
        </div>
      );
    }

    if (orders.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ShoppingCart className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No orders found</h3>
          <p className="text-muted-foreground mb-4">
            Looks like there are no orders yet. Add a new one!
          </p>
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Order
          </Button>
        </div>
      );
    }

    return (
      <div className="grid gap-6">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-lg font-semibold">
                Order #{order.id.substring(0, 8)}
              </h3>
              <Badge variant={getStatusVariant(order.status)}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm text-muted-foreground">
                <User className="h-4 w-4 mr-2" />
                <span>Customer ID: {order.user.substring(0, 8)}...</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{order.shippingAddress}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4 mr-2" />
                <span>{formatPaymentMethod(order.paymentMethod)}</span>
              </div>
              {order.createdAt && (
                <div className="text-sm text-muted-foreground">
                  Ordered: {new Date(order.createdAt).toLocaleString()}
                </div>
              )}

              <div className="mt-4">
                <h4 className="font-semibold text-md mb-2">Items:</h4>
                <ul className="space-y-2">
                  {order.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3">
                      <div>
                        <p className="font-medium">Book ID: {item.book.substring(0, 8)}...</p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(order)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteOrder(order.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const OrderForm = ({
    onSubmit,
    submitText,
  }: {
    onSubmit: () => void;
    submitText: string;
  }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="user">Customer ID</Label>
          <Input
            id="user"
            value={formData.user}
            onChange={(e) => setFormData({ ...formData, user: e.target.value })}
            placeholder="e.g., 68497d6e53294f7739af8cf3"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value: Order["status"]) =>
              setFormData({ ...formData, status: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {orderStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="shippingAddress">Shipping Address</Label>
        <Input
          id="shippingAddress"
          value={formData.shippingAddress}
          onChange={(e) =>
            setFormData({ ...formData, shippingAddress: e.target.value })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentMethod">Payment Method</Label>
        <Input
          id="paymentMethod"
          value={formData.paymentMethod}
          onChange={(e) =>
            setFormData({ ...formData, paymentMethod: e.target.value })
          }
          required
        />
      </div>

      <h4 className="text-md font-semibold mt-4">Order Items</h4>
      {formData.items.map((item, index) => (
        <div key={index} className="flex items-end gap-2 border p-2 rounded-md">
          <div className="flex-1 space-y-2">
            <Label htmlFor={`bookId-${index}`}>Book ID</Label>
            <Input
              id={`bookId-${index}`}
              value={item.bookId}
              onChange={(e) =>
                handleItemChange(index, "bookId", e.target.value)
              }
              placeholder="e.g., 684a7b19eb1660a165883646"
              required
            />
          </div>
          <div className="w-24 space-y-2">
            <Label htmlFor={`quantity-${index}`}>Quantity</Label>
            <Input
              id={`quantity-${index}`}
              type="number"
              value={item.quantity}
              onChange={(e) =>
                handleItemChange(index, "quantity", e.target.value)
              }
              min="1"
              required
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => removeItemField(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={addItemField}
        className="mt-2"
      >
        <Plus className="mr-2 h-4 w-4" /> Add Item
      </Button>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          variant="outline"
          onClick={() => setIsAddEditDialogOpen(false)}
        >
          Cancel
        </Button>
        <Button type="submit" onClick={onSubmit}>
          {submitText}
        </Button>
      </div>
    </div>
  );

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
            <h1 className="font-semibold">Orders Management</h1>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold">Orders Management</h1>
                  <p className="text-muted-foreground">Manage customer orders</p>
                </div>

                <Dialog
                  open={isAddEditDialogOpen}
                  onOpenChange={setIsAddEditDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button onClick={openAddDialog}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Order
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingOrder ? "Edit Order" : "Add New Order"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingOrder
                          ? "Update the details of this order"
                          : "Create a new order for a customer"}
                      </DialogDescription>
                    </DialogHeader>
                    <OrderForm
                      onSubmit={handleAddEditOrder}
                      submitText={editingOrder ? "Update Order" : "Add Order"}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              {renderContent()}
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