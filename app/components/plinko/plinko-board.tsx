import { Physics, usePlane, useSphere } from '@react-three/cannon'
import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useState, useEffect } from 'react'
import { type Mesh } from 'three'

const Peg = ({ position }: { position: [number, number, number] }) => {
  const [ref] = useSphere<Mesh>(() => ({
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
  const [ref, api] = useSphere<Mesh>(() => ({
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

const Wall = ({
  position,
  size,
}: {
  position: [number, number, number]
  size: [number, number, number]
}) => {
  const [ref] = usePlane<Mesh>(() => ({ position, rotation: [0, 0, 0] }))
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
  return null // We don't need to render anything for this collision detector
}

interface PlinkoProps {
  onScore: (score: number) => void
  discs: { position: [number, number, number] }[]
}

export const PlinkoBoard = ({ onScore, discs }: PlinkoProps) => {
  const [pegs, setPegs] = useState<{ position: [number, number, number] }[]>([])

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
