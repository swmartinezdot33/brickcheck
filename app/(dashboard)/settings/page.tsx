import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and API integrations</p>
      </div>

      <Card>
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

