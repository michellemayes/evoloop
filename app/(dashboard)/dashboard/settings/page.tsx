"use client"

import { Suspense } from "react"
import { authClient } from "@/lib/auth-client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Shield,
  ExternalLink,
  Loader2
} from "lucide-react"
import Link from "next/link"

function SettingsContent() {
  const { data: session } = authClient.useSession()
  const user = session?.user

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings.
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
          <CardDescription>
            Your account information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Display Name</p>
              <p className="font-medium">{user?.name || "Not set"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="font-medium">{user?.email || "Not set"}</p>
            </div>
          </div>
          <Separator />
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">User ID</p>
            <p className="font-mono text-sm text-muted-foreground">{user?.id || "—"}</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link href="/auth/account">
              Manage Account
              <ExternalLink className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </CardFooter>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <p className="font-medium">Password & Authentication</p>
              <p className="text-sm text-muted-foreground">
                Change your password or set up two-factor authentication
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/auth/account">
                Manage
              </Link>
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <p className="font-medium">Connected Accounts</p>
              <p className="text-sm text-muted-foreground">
                Manage social logins and connected services
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/auth/account">
                Manage
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/10">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button variant="destructive" asChild>
              <Link href="/auth/account">
                Delete Account
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SettingsLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsLoading />}>
      <SettingsContent />
    </Suspense>
  )
}
