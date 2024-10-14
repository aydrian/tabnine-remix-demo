import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useState } from 'react'
import { PlinkoBoard } from './plinko-board'

export default function PlinkoGame() {
  const [score, setScore] = useState(0)
  const [discs, setDiscs] = useState<{ position: [number, number, number] }[]>(
    [],
  )

  const handleScore = (points: number) => {
    setScore(prevScore => {
      const newScore = prevScore + points
      console.log('Score updated:', newScore)
      return newScore
    })
  }

  const addDisc = () => {
    const x = (Math.random() - 0.5) * 2
    setDiscs(prev => {
      const newDisc = { position: [x, 5, 1] as [number, number, number] }
      return [...prev, newDisc]
    })
  }

  const handleAddDisc = () => {
    console.log('Attempting to add disc')
    addDisc()
  }

  return (
    <>
      <div className="bg-gray-100 p-4">
        <h1 className="mb-2 text-2xl font-bold">Plinko Game</h1>
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">Score: {score}</div>
          <button
            onClick={handleAddDisc}
            className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
          >
            Drop Disc
          </button>
        </div>
      </div>
      <div className="flex-grow">
        <Canvas>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <PlinkoBoard onScore={handleScore} discs={discs} />
          <OrbitControls />
        </Canvas>
      </div>
    </>
  )
}
