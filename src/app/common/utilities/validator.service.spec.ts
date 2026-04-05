import { ValidatorService } from './validator.service'

describe('ValidatorService', () => {
  let service: ValidatorService

  beforeEach(() => {
    service = new ValidatorService()
  })

  describe('isDigit', () => {
    it('should return true for a string of digits', () => {
      expect(service.isDigit('123456')).toBe(true)
    })

    it('should return false for a string with letters', () => {
      expect(service.isDigit('123abc')).toBe(false)
    })
  })

  describe('isValidEmail', () => {
    const regex = new ValidatorService().isValidEmail()

    it('should match a valid email', () => {
      expect(regex.test('test@example.com')).toBe(true)
    })

    it('should fail on missing domain', () => {
      expect(regex.test('user@')).toBe(false)
    })
  })
})
