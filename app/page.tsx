"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getUserProfile } from "@/lib/storage"
import type { UserProfile } from "@/lib/types"
import { MoonStar, Sun, User } from "lucide-react"
import { useTheme } from "next-themes"
import ProfileSetup from "@/components/profile-setup"
import Dashboard from "@/components/dashboard"
import LogWalk from "@/components/log-walk"
import LogWeight from "@/components/log-weight"
import Milestones from "@/components/milestones"

export default function Home() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    // Load user profile from local storage
    const profile = getUserProfile()
    setUserProfile(profile)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  // If no profile exists, show the profile setup form
  if (!userProfile) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-end p-4">
          <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Welcome to Standing Desk Walk Tracker</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileSetup onProfileSaved={(profile) => setUserProfile(profile)} />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Standing Desk Walk Tracker</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="mb-4 grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="log-walk">Log Walk</TabsTrigger>
          <TabsTrigger value="log-weight">Log Weight</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
          <Dashboard userProfile={userProfile} />
        </TabsContent>
        <TabsContent value="log-walk">
          <LogWalk userProfile={userProfile} />
        </TabsContent>
        <TabsContent value="log-weight">
          <LogWeight userProfile={userProfile} />
        </TabsContent>
        <TabsContent value="milestones">
          <Milestones userProfile={userProfile} />
        </TabsContent>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileSetup initialData={userProfile} onProfileSaved={(profile) => setUserProfile(profile)} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

