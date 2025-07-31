import { ReactNode } from 'react'
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  Settings, 
  LogOut,
  Bell,
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface DashboardLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
  userRole: 'admin' | 'manager'
}

export function DashboardLayout({ 
  children, 
  title, 
  subtitle, 
  userRole 
}: DashboardLayoutProps) {
  const navigationItems = {
    admin: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
      { icon: Users, label: 'User Management', href: '/admin/users' },
      { icon: Settings, label: 'System Settings', href: '/admin/settings' },
      { icon: ClipboardList, label: 'All Orders', href: '/admin/orders' },
    ],
    manager: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/manager' },
      { icon: Users, label: 'Team', href: '/manager/team' },
      { icon: ClipboardList, label: 'Orders', href: '/manager/orders' },
      { icon: Settings, label: 'Settings', href: '/manager/settings' },
    ]
  }

  const navItems = navigationItems[userRole] || []

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-primary">ServeNow</h1>
          <p className="text-sm text-muted-foreground capitalize">{userRole} Panel</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="nav-link"
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* User section */}
        <div className="p-4 border-t">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-medium">
                {userRole.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{userRole} User</p>
              <p className="text-xs text-muted-foreground">user@servenow.com</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-card border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{title}</h1>
              {subtitle && (
                <p className="text-muted-foreground">{subtitle}</p>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-10 w-64"
                />
              </div>
              
              {/* Notifications */}
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}