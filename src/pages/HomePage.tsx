import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="max-w-3xl mx-auto text-center py-12">
      <h1 className="text-5xl font-bold tracking-tight mb-4">
        Global Business Identity
      </h1>
      <p className="text-lg text-base-content/60 mb-8">
        Register your company once, reuse everywhere — public profile, QR code, GBID.
      </p>
      <div className="flex justify-center gap-4">
        <Link to="/signup" className="btn btn-primary btn-lg">Get Started</Link>
        <Link to="/countries" className="btn btn-outline btn-lg">Browse Countries</Link>
      </div>
    </div>
  )
}
