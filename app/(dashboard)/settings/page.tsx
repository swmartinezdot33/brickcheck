import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted-foreground">Manage your account and API integrations</p>
      </div>

      <Card className="border-2 border-primary/20 bg-gradient-to-br from-yellow-50/30 to-transparent dark:from-yellow-950/20">
        <CardHeader>
          <CardTitle>API Health</CardTitle>
          <CardDescription>Status of external API integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            API health monitoring will be available after API integrations are set up.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

