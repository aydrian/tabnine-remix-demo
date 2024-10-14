import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useState, useEffect, useCallback } from 'react'
import { PlinkoBoard } from './plinko-board'

const BOARD_WIDTH = 4.5 // This should match the width between the walls in your PlinkoBoard component
const MOVE_STEP = 0.1 // How much to move the disc on each key press

export default function PlinkoGame() {
  const [score, setScore] = useState(0)
  const [discs, setDiscs] = useState<
    { id: string; position: [number, number, number] }[]
  >([])
  const [discX, setDiscX] = useState(0)

  const handleScore = (points: number) => {
    setScore(prevScore => {
      const newScore = prevScore + points
      console.log('Score updated:', newScore)
      return newScore
    })
  }

  const addDisc = useCallback(() => {
    setDiscs(prev => {
      const newDisc = {
        id: `disc-${Date.now()}`, // Generate a unique id
        position: [discX, 2.5, 0] as [number, number, number], // Use current discX here
      }
      return [...prev, newDisc]
    })
  }, [discX])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        setDiscX(prev => Math.max(-BOARD_WIDTH / 2, prev - MOVE_STEP))
      } else if (event.key === 'ArrowRight') {
        setDiscX(prev => Math.min(BOARD_WIDTH / 2, prev + MOVE_STEP))
      } else if (event.key === ' ' || event.key === 'Enter') {
        addDisc()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [addDisc])

  return (
    <>
      <div className="bg-gray-100 p-4">
        <h1 className="mb-2 text-2xl font-bold">Plinko Game</h1>
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">Score: {score}</div>
        </div>
        <div className="inset-0 flex items-center justify-center">
          <p className="text-xl text-blue-800">
            Use ← → to move, Space or Enter to drop disc
          </p>
        </div>
      </div>
      <div className="flex-grow">
        <Canvas>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <PlinkoBoard onScore={handleScore} discs={discs} />
          <mesh position={[discX, 2.5, 0]}>
            <sphereGeometry args={[0.1, 32, 32]} />
            <meshStandardMaterial color="red" opacity={0.5} transparent />
          </mesh>
          <OrbitControls />
        </Canvas>
      </div>
    </>
  )
}
