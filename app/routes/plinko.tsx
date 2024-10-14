import { Physics, usePlane, useSphere } from '@react-three/cannon'
import { OrbitControls, Text } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useState, useEffect } from 'react'

const Peg = ({ position }: { position: [number, number, number] }) => {
  const [ref] = useSphere(() => ({
    type: 'Static',
    args: [0.05],
    position,
  }))

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.05, 32, 32]} />
      <meshStandardMaterial color="white" />
    </mesh>
  )
}

const Disc = ({ position }: { position: [number, number, number] }) => {
  const [ref, api] = useSphere(() => ({
    mass: 1,
    args: [0.1],
    position,
  }))

  useFrame(() => {
    api.velocity.subscribe(v => {
      if (v[1] < -4) {
        // Remove the disc when it falls below the board
        api.position.set(1000, 1000, 1000) // Move it far away
      }
    })
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.1, 32, 32]} />
      <meshStandardMaterial color="red" />
    </mesh>
  )
}

const PlinkoBoard = ({ onScore }: { onScore: (score: number) => void }) => {
  const [pegs, setPegs] = useState<(typeof Peg)[]>([])

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
    console.log('Pegs initialized:', newPegs.length)
  }, [])

  // Create walls
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

  // Create bottom planes for scoring
  const ScorePlane = ({
    position,
    onCollide,
  }: {
    position: [number, number, number]
    onCollide: () => void
  }) => {
    const [ref] = usePlane(() => ({
      position,
      rotation: [-Math.PI / 2, 0, 0],
      onCollide,
    }))
    return null // We don't need to render anything for this collision detector
  }

  return (
    <Physics>
      <group>
        {/* Walls */}
        <Wall position={[-2.25, 0, 0]} size={[0.1, 9, 1]} />
        <Wall position={[2.25, 0, 0]} size={[0.1, 9, 1]} />
        <Wall position={[0, 4.45, 0]} size={[4.5, 0.1, 1]} />

        {/* Pegs */}
        {pegs.map((peg, index) => (
          <Peg key={index} position={peg.position} />
        ))}

        {/* Discs */}
        {discs.map((disc, index) => (
          <Disc key={index} position={disc.position} />
        ))}

        {/* Scoring planes */}
        {Array.from({ length: 9 }, (_, i) => (
          <ScorePlane
            key={i}
            position={[(i - 4) * 0.5, -4.45, 0]}
            onCollide={() => {
              onScore(i + 1)
              console.log('Disc reached bottom. Score:', i + 1)
            }}
          />
        ))}

        {/* Score numbers */}
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

export default function Plinko() {
  const [score, setScore] = useState(0)
  const [discs, setDiscs] = useState<Disc[]>([])

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
      const newDisc: Disc = { position: [x, 5, 0] }
      return [...prev, newDisc]
    })
  }

  const handleAddDisc = () => {
    console.log('Attempting to add disc')
    addDisc()
  }

  return (
    <div className="flex h-screen w-full flex-col">
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
          <PlinkoBoard
            onScore={handleScore}
            discs={discs}
            setDiscs={setDiscs}
          />
          <OrbitControls />
        </Canvas>
      </div>
    </div>
  )
}
