import './globals.css'
import { Inter as FontSans } from 'next/font/google'

import { AlertDialogConfirmProvider } from '@/components/alert-dialog-confirm-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
})

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn('bg-background min-h-screen font-sans antialiased', fontSans.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AlertDialogConfirmProvider>{children}</AlertDialogConfirmProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

export default RootLayout
