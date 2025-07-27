import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Payment Status - ServeNow',
  description: 'Payment processing status for your order',
}

export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}