import { Physics, usePlane, useSphere } from '@react-three/cannon'
import { OrbitControls, Text } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useState, useEffect } from 'react'

const Peg = ({ position }: { position: [number, number, number] }) => {
  const [ref] = useSphere(() => ({ args: [0.1], position, type: 'Static' }))
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.1, 32, 32]} />
      <meshStandardMaterial color="blue" />
    </mesh>
  )
}

const Disc = ({ position }: { position: [number, number, number] }) => {
  const [ref, api] = useSphere(() => ({
    mass: 1,
    args: [0.1],
    position,
  }))

  useEffect(() => {
    const unsubscribe = api.position.subscribe(p => {
      if (p[1] < -4.5) {
        api.position.set(1000, 1000, 1000) // Move it far away when it falls below the board
      }
    })
    return unsubscribe
  }, [api])

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.1, 32, 32]} />
      <meshStandardMaterial color="red" />
    </mesh>
  )
}

const PlinkoBoard = ({ onScore }: { onScore: (score: number) => void }) => {
  const [pegs, setPegs] = useState<{ position: [number, number, number] }[]>([])
  const [discs, setDiscs] = useState<{ position: [number, number, number] }[]>(
    [],
  )

  useEffect(() => {
    const pegRows = 8
    const pegsPerRow = 9
    const newPegs: { position: [number, number, number] }[] = []

    for (let row = 0; row < pegRows; row++) {
      for (
        let col = 0;
        col < (row % 2 === 0 ? pegsPerRow : pegsPerRow - 1);
        col++
      ) {
        const x = (col - (pegsPerRow - 1) / 2 + (row % 2 === 0 ? 0 : 0.5)) * 0.5
        const y = (row - pegRows / 2) * 0.5
        newPegs.push({ position: [x, y, 0] })
      }
    }

    setPegs(newPegs)
  }, [])

  const Wall = ({
    position,
    size,
  }: {
    position: [number, number, number]
    size: [number, number, number]
  }) => {
    const [ref] = usePlane(() => ({ position, rotation: [0, 0, 0] }))
    return (
      <mesh ref={ref} position={position}>
        <planeGeometry args={size} />
        <meshStandardMaterial color="black" />
      </mesh>
    )
  }

  const ScorePlane = ({
    position,
    onCollide,
  }: {
    position: [number, number, number]
    onCollide: () => void
  }) => {
    usePlane(() => ({
      position,
      rotation: [-Math.PI / 2, 0, 0],
      onCollide,
    }))
    return null
  }

  return (
    <Physics>
      <group>
        <Wall position={[-2.25, 0, 0]} size={[0.1, 9, 1]} />
        <Wall position={[2.25, 0, 0]} size={[0.1, 9, 1]} />
        <Wall position={[0, 4.45, 0]} size={[4.5, 0.1, 1]} />

        {pegs.map((peg, index) => (
          <Peg key={index} position={peg.position} />
        ))}

        {discs.map((disc, index) => (
          <Disc key={index} position={disc.position} />
        ))}

        {Array.from({ length: 9 }, (_, i) => (
          <ScorePlane
            key={i}
            position={[(i - 4) * 0.5, -4.45, 0]}
            onCollide={() => onScore(i + 1)}
          />
        ))}

        {Array.from({ length: 9 }, (_, i) => (
          <Text
            key={i}
            position={[(i - 4) * 0.5, -4.5, 0]}
            fontSize={0.2}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {i + 1}
          </Text>
        ))}
      </group>
    </Physics>
  )
}

export default function Plinko2Page() {
  const [score, setScore] = useState(0)
  const [discs, setDiscs] = useState<{ position: [number, number, number] }[]>(
    [],
  )

  const handleScore = (points: number) => {
    setScore(prevScore => prevScore + points)
  }

  const addDisc = () => {
    const x = (Math.random() - 0.5) * 2
    setDiscs(prev => [...prev, { position: [x, 5, 0] }])
  }

  return (
    <div className="flex h-screen w-full flex-col">
      <div className="bg-gray-100 p-4">
        <h1 className="mb-2 text-2xl font-bold">Plinko Game</h1>
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">Score: {score}</div>
          <button
            onClick={addDisc}
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
          <PlinkoBoard onScore={handleScore} />
          <OrbitControls />
        </Canvas>
      </div>
    </div>
  )
}
