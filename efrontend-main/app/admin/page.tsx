"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, ShoppingCart, Users, TrendingUp, LayoutDashboard, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { checkAdminAccess } from "@/lib/checkAdminStatus"

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
]

function Sidebar() {
  const pathname = usePathname()

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
          const isActive = pathname === item.href
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
          )
        })}
      </nav>
      <div className="border-t p-4">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Store
        </Link>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const stats = [
    {
      title: "Total Books",
      value: "1,234",
      description: "+12% from last month",
      icon: BookOpen,
      color: "text-blue-600",
    },
    {
      title: "Total Orders",
      value: "856",
      description: "+8% from last month",
      icon: ShoppingCart,
      color: "text-green-600",
    },
    {
      title: "Total Users",
      value: "2,341",
      description: "+15% from last month",
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Revenue",
      value: "$12,345",
      description: "+20% from last month",
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ]

  const recentOrders = [
    { id: "ORD-001", customer: "John Doe", total: 45.97, status: "Completed" },
    { id: "ORD-002", customer: "Jane Smith", total: 23.99, status: "Processing" },
    { id: "ORD-003", customer: "Bob Johnson", total: 67.98, status: "Shipped" },
    { id: "ORD-004", customer: "Alice Brown", total: 34.5, status: "Pending" },
  ]
  
  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <div className="flex flex-col flex-1">
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 md:hidden">
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <h1 className="font-semibold">Admin Panel</h1>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">Welcome to your admin dashboard</p>
              </div>

              {/* Stats Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                  <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <p className="text-xs text-muted-foreground">{stat.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Latest orders from your customers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{order.id}</p>
                          <p className="text-sm text-muted-foreground">{order.customer}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${order.total}</p>
                          <p className="text-sm text-muted-foreground">{order.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
        <SheetContent side="left" className="p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>
    </div>
  )
}
