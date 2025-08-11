'use client';

import { Button } from '@/components/ui/button';
import { Toast, toast } from '@/components/ui/toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Confirmer, confirm } from '@/components/ui/confirmer';
import { ModeToggle } from '@/components/mode-toggle';

export default function Home() {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-4xl gap-8 p-6">
      <section>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">@ui-call/react Demo</h1>
            <p className="text-muted-foreground">
              Small examples showing how <code>@ui-call/react</code> powers UI patterns.
            </p>
          </div>
          <ModeToggle />
        </div>
      </section>

      <div className="flex flex-1 flex-col gap-8">
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
              onClick={() =>
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

        <Toast />
        <Card>
          <CardHeader>
            <CardTitle>Toast</CardTitle>
            <CardDescription>
              Sonner-like API implemented with <code>CallStore</code>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() =>
                  toast({
                    title: 'Default Toast',
                    description: 'This is a default toast notification',
                  })
                }
              >
                Default Toast
              </Button>

              <Button
                variant="secondary"
                onClick={() =>
                  toast.success({
                    title: 'Success!',
                    description: 'Your action was completed successfully',
                  })
                }
              >
                Success Toast
              </Button>

              <Button
                variant="destructive"
                onClick={() =>
                  toast.error({
                    title: 'Error!',
                    description: 'Something went wrong with your request',
                  })
                }
              >
                Error Toast
              </Button>

              <Button
                variant="outline"
                onClick={() =>
                  toast.info({ title: 'Info', description: 'Here is some useful information' })
                }
              >
                Info Toast
              </Button>

              <Button
                variant="ghost"
                onClick={() =>
                  toast({
                    title: 'With Action',
                    description: 'This toast has an action button',
                    action: {
                      label: 'Undo',
                      onClick: () => alert('Action clicked!'),
                    },
                  })
                }
              >
                Toast with Action
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
