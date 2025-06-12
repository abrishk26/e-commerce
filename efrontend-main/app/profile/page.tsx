"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, ShoppingBag, Heart, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

export default function ProfilePage() {
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  if (!user) {
    return null
  }

  const recentOrders = [
    { id: "ORD-001", date: "2024-01-15", total: 45.97, status: "Delivered" },
    { id: "ORD-002", date: "2024-01-10", total: 23.99, status: "Shipped" },
    { id: "ORD-003", date: "2024-01-05", total: 67.98, status: "Processing" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        searchTerm=""
        setSearchTerm={() => {}}
        cartItems={[]}
        cartTotal={0}
        removeFromCart={() => {}}
        isCartOpen={false}
        setIsCartOpen={() => {}}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle>{user.name}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Member since January 2024</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  <span>12 orders completed</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <span>8 books in wishlist</span>
                </div>
                <Separator />
                <Button className="w-full" variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Your latest book purchases</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{order.id}</p>
                        <p className="text-sm text-muted-foreground">{order.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${order.total}</p>
                        <Badge variant={order.status === "Delivered" ? "default" : "secondary"}>{order.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Orders
                </Button>
              </CardContent>
            </Card>

            {/* Reading Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Reading Statistics</CardTitle>
                <CardDescription>Your reading journey this year</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">24</p>
                    <p className="text-sm text-muted-foreground">Books Read</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">8</p>
                    <p className="text-sm text-muted-foreground">Reviews Written</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">Fiction</p>
                    <p className="text-sm text-muted-foreground">Favorite Genre</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">4.2</p>
                    <p className="text-sm text-muted-foreground">Avg Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Wishlist Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Wishlist</CardTitle>
                <CardDescription>Books you want to read</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="text-center">
                      <img
                        src="/placeholder.svg?height=120&width=80"
                        alt="Book cover"
                        className="w-full h-24 object-cover rounded mb-2"
                      />
                      <p className="text-xs font-medium line-clamp-2">Book Title {i}</p>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View Full Wishlist
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
