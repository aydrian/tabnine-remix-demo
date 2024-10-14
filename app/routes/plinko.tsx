import { ClientOnly } from 'remix-utils/client-only'
import PlinkoGame from '~/components/plinko/plinko-game.client'

export default function Plinko() {
  return (
    <div className="flex h-screen w-full flex-col">
      <ClientOnly fallback={<p>Loading...</p>}>
        {() => <PlinkoGame />}
      </ClientOnly>
    </div>
  )
}
