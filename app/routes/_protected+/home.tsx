import { Link } from '@remix-run/react'

export default function Protected() {
  return (
    <div className="flex h-screen flex-col items-center space-y-4">
      <Link to="/todos" className="text-blue-600 underline hover:text-blue-800">
        My Todo List
      </Link>
    </div>
  )
}
