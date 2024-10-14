import {
  Physics,
  useCylinder,
  useBox,
  usePlane,
  useSphere,
} from '@react-three/cannon'
import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useState, useEffect, useRef } from 'react'
import { Vector3, type Mesh } from 'three'

const Peg = ({ position }: { position: [number, number, number] }) => {
  const [ref] = useCylinder<Mesh>(() => ({
    type: 'Static',
    args: [0.05, 0.05, 0.5, 16], // radius top, radius bottom, height, number of segments
    position,
    rotation: [Math.PI / 2, 0, 0], // Rotate 90 degrees around x-axis to make it stand upright
    collisionFilterGroup: 1,
    collisionFilterMask: 2,
  }))

  return (
    <mesh ref={ref}>
      <cylinderGeometry args={[0.05, 0.05, 0.2, 16]} />
      <meshStandardMaterial color="white" />
    </mesh>
  )
}

const Disc = ({
  position,
  id,
}: {
  position: [number, number, number]
  id: string
}) => {
  const [ref, api] = useSphere<Mesh>(() => ({
    mass: 1,
    args: [0.1],
    position,
    collisionFilterGroup: 2,
    collisionFilterMask: 1 | 2,
    velocity: [0, 0, 0], // Initialize with zero velocity
    linearDamping: 0.5,
    material: {
      restitution: 0.7,
    },
    userData: { id },
  }))

  const velocity = useRef([0, 0, 0])
  useEffect(() => {
    api.velocity.subscribe(v => (velocity.current = v))
  }, [api.velocity])

  useFrame(() => {
    api.position.subscribe(p => {
      if (p[1] < -5) {
        api.position.set(1000, 1000, 1000)
      }
    })

    // Remove the horizontal force application
    // api.applyForce([0, -1, 0], [0, 0, 0])

    const maxVelocity = 5
    const currentVelocity = new Vector3(...velocity.current)
    if (currentVelocity.length() > maxVelocity) {
      currentVelocity.setLength(maxVelocity)
      api.velocity.set(currentVelocity.x, currentVelocity.y, currentVelocity.z)
    }
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
  color = 'black',
}: {
  position: [number, number, number]
  size: [number, number, number]
  color?: string
}) => {
  const [ref] = useBox<Mesh>(() => ({
    position,
    args: size,
    type: 'Static',
    collisionFilterGroup: 1,
    collisionFilterMask: 2,
  }))
  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

const ScorePlane = ({
  position,
  onCollide,
}: {
  position: [number, number, number]
  onCollide: (discId: string) => void
}) => {
  const scoredDiscs = useRef(new Set<string>())

  usePlane(() => ({
    position,
    rotation: [-Math.PI / 2, 0, 0],
    collisionFilterGroup: 1,
    collisionFilterMask: 2,
    onCollide: collision => {
      const discId = collision.body.userData.id
      if (!scoredDiscs.current.has(discId)) {
        scoredDiscs.current.add(discId)
        onCollide(discId)
      }
    },
  }))
  return null
}

interface PlinkoProps {
  onScore: (score: number) => void
  discs: { id: string; position: [number, number, number] }[]
}

export const PlinkoBoard = ({ onScore, discs }: PlinkoProps) => {
  const [pegs, setPegs] = useState<{ position: [number, number, number] }[]>([])
  const [scoredDiscs, setScoredDiscs] = useState(new Set<string>())

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
    <Physics
      gravity={[0, -9.81, 0]}
      defaultContactMaterial={{
        friction: 0.1,
        restitution: 0.7,
      }}
    >
      <group>
        {/* Walls */}
        <Wall position={[-2.25, 0, 0]} size={[0.1, 5.25, 0.2]} />
        <Wall position={[2.25, 0, 0]} size={[0.1, 5.25, 0.2]} />

        {/* Pegs */}
        {pegs.map((peg, index) => (
          <Peg key={index} position={peg.position} />
        ))}

        {/* Discs */}
        {discs.map(disc => (
          <Disc key={disc.id} id={disc.id} position={disc.position} />
        ))}

        {/* Scoring planes */}
        {Array.from({ length: 9 }, (_, i) => (
          <ScorePlane
            key={i}
            position={[(i - 4) * 0.5, -2.45, 0]}
            onCollide={discId => {
              if (!scoredDiscs.has(discId)) {
                setScoredDiscs(prev => new Set(prev).add(discId))
                onScore(i + 1)
                console.log('Disc reached bottom. Score:', i + 1)
              }
            }}
          />
        ))}

        {/* Score numbers */}
        {Array.from({ length: 9 }, (_, i) => (
          <Text
            key={i}
            position={[(i - 4) * 0.5, -2.5, 0]}
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
