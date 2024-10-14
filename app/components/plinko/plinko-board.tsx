import { Physics, useCylinder, useBox, useSphere } from '@react-three/cannon'
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
  const [ref, api] = useSphere<Mesh>(
    () => ({
      mass: 1,
      args: [0.1],
      position,
      collisionFilterGroup: 2,
      collisionFilterMask: 1 | 2,
      velocity: [0, 0, 0],
      linearDamping: 0.5,
      material: {
        restitution: 0.7,
      },
    }),
    useRef<Mesh>(null),
  )

  useEffect(() => {
    if (ref.current) {
      ref.current.userData = { id, type: 'disc', api }
    }
  }, [id, api, ref])

  const velocity = useRef([0, 0, 0])
  useEffect(() => {
    api.velocity.subscribe(v => (velocity.current = v))
  }, [api.velocity])

  useFrame(() => {
    api.position.subscribe(p => {
      if (p && p[1] < -5) {
        api.position.set(1000, 1000, 1000)
      }
    })

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

const Bucket = ({
  position,
  onScore,
  score,
  points,
}: {
  position: [number, number, number]
  onScore: (discId: string) => void
  score: number
  points: number
}) => {
  const [ref] = useBox<Mesh>(() => ({
    type: 'Static',
    args: [0.45, 0.5, 0.2],
    position,
    collisionFilterGroup: 1,
    collisionFilterMask: 2,
    onCollide: e => {
      if (e.body.userData && e.body.userData.type === 'disc') {
        const discId = e.body.userData.id
        const discApi = e.body.userData.api
        onScore(discId)
        discApi.position.set(1000, 1000, 1000) // Remove disc
      }
    },
  }))

  return (
    <group>
      <mesh ref={ref}>
        <boxGeometry args={[0.45, 0.5, 0.2]} />
        <meshStandardMaterial color="blue" />
      </mesh>
      <mesh position={[position[0], position[1], position[2] + 0.101]}>
        <planeGeometry args={[0.45, 0.5]} />
        <meshStandardMaterial color="red" />
      </mesh>
      <Text
        position={[position[0], position[1] + 0.1, position[2] + 0.102]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {score}
      </Text>
      <Text
        position={[position[0], position[1] - 0.1, position[2] + 0.102]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {points}pts
      </Text>
    </group>
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

interface PlinkoProps {
  onScore: (score: number) => void
  discs: { id: string; position: [number, number, number] }[]
}

export const PlinkoBoard = ({ onScore, discs }: PlinkoProps) => {
  const [pegs, setPegs] = useState<{ position: [number, number, number] }[]>([])
  const [scores, setScores] = useState<number[]>(Array(9).fill(0))
  const bucketPoints = [1, 2, 3, 4, 5, 4, 3, 2, 1] // Define points for each bucket
  const bucketWidth = 4.5 / bucketPoints.length // Width of each bucket

  useEffect(() => {
    const pegRows = 8
    const pegsPerRow = 9
    const newPegs = Array.from({ length: pegRows }, (_, row) =>
      Array.from(
        { length: row % 2 === 0 ? pegsPerRow : pegsPerRow - 1 },
        (_, col) => ({
          position: [
            (col - (pegsPerRow - 1) / 2 + (row % 2 === 0 ? 0 : 0.5)) * 0.5,
            (row - pegRows / 2) * 0.5,
            0,
          ] as [number, number, number],
        }),
      ),
    ).flat()

    setPegs(newPegs)
    console.log('Pegs initialized:', newPegs.length)
  }, [])

  const handleBucketScore = (bucketIndex: number) => {
    setScores(prevScores => {
      const newScores = [...prevScores]
      newScores[bucketIndex]++
      onScore(bucketIndex + 1)
      return newScores
    })
  }

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
        <Wall position={[-2.25, 0, 0]} size={[0.1, 6, 0.2]} />
        <Wall position={[2.25, 0, 0]} size={[0.1, 6, 0.2]} />

        {/* Pegs */}
        {pegs.map((peg, index) => (
          <Peg key={index} position={peg.position} />
        ))}

        {/* Discs */}
        {discs.map(disc => (
          <Disc key={disc.id} id={disc.id} position={disc.position} />
        ))}

        {/* Buckets */}
        {bucketPoints.map((points, i) => (
          <Bucket
            key={`bucket-${i}`}
            position={[
              (i - (bucketPoints.length - 1) / 2) * bucketWidth,
              -2.75,
              0,
            ]}
            onScore={() => handleBucketScore(i)}
            score={scores[i]}
            points={points}
          />
        ))}
      </group>
    </Physics>
  )
}
