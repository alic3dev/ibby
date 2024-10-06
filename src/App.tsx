import React from 'react'

import _messages from '../gen-data/messages.json'
const messages: string[] = _messages as string[]

const getRandomMessage = (): string =>
  messages[Math.floor(Math.random() * messages.length)]

export function App(): React.ReactNode {
  const [currentMessage, setCurrentMessage] = React.useState<string>('')
  const [autoPlay, setAutoPlay] = React.useState<boolean>(true)

  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  const getNextMessage = React.useCallback((): void => {
    setCurrentMessage(getRandomMessage())
  }, [])

  const autoNext = React.useCallback((): void => {
    setAutoPlay((prevAutoPlay: boolean): boolean => !prevAutoPlay)
  }, [])

  React.useEffect((): void | (() => void) => {
    if (!autoPlay) return

    const autoPlayInterval: number = window.setInterval((): void => {
      setCurrentMessage(getRandomMessage())
    }, 50)

    const ctx: CanvasRenderingContext2D | null | undefined =
      canvasRef.current?.getContext('2d', { willReadFrequently: true })

    let renderCanvasFrame: number = 0
    let frameCount: number = 0

    function renderCanvas(): void {
      if (!ctx) return

      ctx.fillStyle = '#FFFFFF02'
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

      const imageData: ImageData = ctx.getImageData(
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height,
      )

      for (let x: number = 0; x < imageData.width; x++) {
        const dataVal: number = Math.floor(
          (Math.sin(
            (((x + frameCount) % imageData.width) / imageData.width) *
              (((Math.PI * frameCount) / 10) % 100),
          ) *
            imageData.height) /
            4,
        )

        const yPos: number =
          Math.floor(imageData.height / 2) * imageData.width * 4 +
          imageData.width * dataVal * 4

        const dataPos: number = x * 4 + yPos
        const colVal: number = (x / imageData.width) * 255

        imageData.data[dataPos] = colVal
        imageData.data[dataPos + 1] = 0
        imageData.data[dataPos + 2] = 255 - colVal
        imageData.data[dataPos + 3] = 255

        const inverseYPos: number =
          Math.floor(imageData.height / 2) * imageData.width * 4 +
          imageData.width * -dataVal * 4

        const inverseDataPos: number = x * 4 + inverseYPos

        imageData.data[inverseDataPos] = 255 - colVal
        imageData.data[inverseDataPos + 1] = 0
        imageData.data[inverseDataPos + 2] = colVal
        imageData.data[inverseDataPos + 3] = 255
      }

      ctx.putImageData(imageData, 0, 0)

      frameCount++

      renderCanvasFrame = window.requestAnimationFrame(renderCanvas)
    }

    renderCanvas()

    return (): void => {
      window.clearInterval(autoPlayInterval)
      window.cancelAnimationFrame(renderCanvasFrame)
    }
  }, [autoPlay])

  return (
    <div className="app">
      <canvas
        ref={canvasRef}
        className="main-canvas"
        width={1920}
        height={1080}
      ></canvas>

      <code className="message">{currentMessage}</code>

      <div className="controls">
        <button onClick={getNextMessage}>Msg</button>
        <button onClick={autoNext}>Auto</button>
      </div>
    </div>
  )
}
