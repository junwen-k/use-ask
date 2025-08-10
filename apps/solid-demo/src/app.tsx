import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Confirmer, confirm } from '@/components/ui/confirmer';

import './app.css';

export default function App() {
  return (
    <main class="mx-auto grid min-h-screen w-full max-w-4xl gap-8 p-6">
      <section>
        <div class="flex items-start justify-between gap-4">
          <div class="space-y-2">
            <h1 class="text-2xl font-bold tracking-tight">@ui-call/solid Demo</h1>
            <p class="text-muted-foreground">
              Small examples showing how <code>@ui-call/solid</code> powers UI patterns.
            </p>
          </div>
          {/* <ModeToggle /> */}
        </div>
      </section>

      <Confirmer />
      <Card>
        <CardHeader>
          <CardTitle>Confirmer</CardTitle>
          <CardDescription>
            Imperative confirm dialog built with <code>SingletonCallStore</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Confirmer />
          <Button
            variant="destructive"
            onclick={() =>
              confirm({
                title: 'Are you absolutely sure?',
                message:
                  'This action cannot be undone. This will permanently delete your account and remove your data from our servers.',
              }).then((result) => alert(`User ${result ? 'confirmed' : 'cancelled'} the action`))
            }
          >
            Delete
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
