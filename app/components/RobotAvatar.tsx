'use client'
import { useEffect, useState } from 'react'

type RobotState = 'idle' | 'thinking' | 'error' | 'off'

interface RobotAvatarProps {
  robotState: RobotState
  onLampToggle?: (lampOn: boolean) => void
}

export default function RobotAvatar({ robotState, onLampToggle }: RobotAvatarProps) {
  const [lampOn, setLampOn] = useState(true)
  const [fade, setFade] = useState(false)

  
  useEffect(() => {
    if (robotState === 'thinking' || robotState === 'idle') {
      setLampOn(true)
    } else {
      setLampOn(false)
    }
  }, [robotState])

  
 

  function toggleLamp() {
    setLampOn((prev) => {
      const newState = !prev
      if (onLampToggle) onLampToggle(newState)
      return newState
    })
  }

  function getImageFilename() {
    switch (robotState) {
      case 'idle':
        return lampOn ? '2.png' : '1.png'
      case 'thinking':
        return '2.png'
      case 'error':
        return lampOn ? '3.png' : '4.png'
      case 'off':
        return lampOn ? '2.png' : '6.png'
      default:
        return '6.png'
    }
  }

  return (
    <div
      onClick={toggleLamp}
      style={{
        position: 'fixed',
        bottom: 100,
        right: -62,
        width: 850,
        height: 850,
        cursor: 'pointer',
        userSelect: 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        transition: 'transform 0.5s ease',
        
        transform: lampOn ? 'translateY(0)' : 'translateY(0)', 
      }}
      className={lampOn ? 'levitate' : 'levitate-paused'}
      
    >
      <img
        src={`/${getImageFilename()}`}
        alt="Robô assistente"
        draggable={false}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          filter: robotState === 'error' ? 'drop-shadow(0 0 6px red)' : 'none',
          transition: 'filter 0.3s ease, opacity 0.3s ease',
          opacity: fade ? 0 : 1,
        }}
      />

      <style jsx>{`
        @keyframes levitate {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .levitate {
          animation: levitate 3s ease-in-out infinite;
          transition: transform 0.5s ease;
        }

        .levitate-paused {
          animation-play-state: paused;
          transform: translateY(0);
          transition: transform 0.5s ease;
        }
      `}</style>
    </div>
  )
}
