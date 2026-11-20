import { useTheme } from '@/components/theme-provider'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

const Toaster = ({ theme: themeOverride, ...props }: ToasterProps) => {
  const { theme } = useTheme()
  const resolvedTheme = themeOverride ?? (theme === 'dark' ? 'dark' : 'light')

  return (
    <Sonner
      theme={resolvedTheme}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--card)',
          '--normal-text': 'var(--card-foreground)',
          '--normal-border': 'var(--border)',
          borderRadius: '12px',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
