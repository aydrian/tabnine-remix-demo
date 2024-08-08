import { type MetaFunction } from '@remix-run/node'
import { Link } from '@remix-run/react'

export const meta: MetaFunction = () => {
  return [
    { title: 'Remix+Vite' },
    { name: 'description', content: 'Welcome to Remix+Vite!' },
  ]
}

const linkStyle = 'underline decoration-dotted'
export default function Index() {
  return (
    <div>
      <div className="flex items-baseline gap-8 bg-blue-700 p-8 text-white">
        <h1 className="text-5xl font-bold">
          Welcome to Remix+Vite Demos with Tabnine
        </h1>
      </div>
      <div className="p-8">
        <ul className="flex flex-col gap-2">
          <li>
            <Link to="/todos" className={linkStyle}>
              My Todos (Requires Auth)
            </Link>
          </li>
          <li>
            <Link to="/error" className={linkStyle}>
              Test Error Handling
            </Link>
          </li>
          <li>
            <Link to="/not-found" className={linkStyle}>
              Not Found Page (Test Root Error Boundary)
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}
