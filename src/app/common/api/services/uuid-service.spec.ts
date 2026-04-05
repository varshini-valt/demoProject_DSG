import { UuidServiceService } from './uuid-service'

describe('UuidServiceService', () => {
  let service: UuidServiceService

  beforeEach(() => {
    service = new UuidServiceService()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should return a valid UUID v4 string', () => {
    const mockBuffer = new Uint8Array(16)
    for (let i = 0; i < 16; i++) {
      mockBuffer[i] = i + 1
    }

    const getRandomValuesMock = jest.fn().mockImplementation((buf: Uint8Array) => {
      for (let i = 0; i < buf.length; i++) {
        buf[i] = mockBuffer[i]
      }
    })

    Object.defineProperty(window, 'crypto', {
      value: { getRandomValues: getRandomValuesMock }
    })

    const uuid = service.uuidv4()

    expect(uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    )

    expect(getRandomValuesMock).toHaveBeenCalledTimes(1)
  })

  it('should call hex 16 times with correct values', () => {
    const hexSpy = jest.spyOn(service, 'hex')

    const mockBuffer = new Uint8Array(16).map((_, i) => i + 1)
    Object.defineProperty(window, 'crypto', {
      value: {
        getRandomValues: (buf: Uint8Array) => {
          for (let i = 0; i < buf.length; i++) {
            buf[i] = mockBuffer[i]
          }
        }
      }
    })

    service.uuidv4()

    expect(hexSpy).toHaveBeenCalledTimes(16)
    for (let i = 0; i < 16; i++) {
      expect(hexSpy).toHaveBeenCalledWith(expect.any(Number))
    }
  })
})
