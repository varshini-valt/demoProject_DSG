import { UserInputService } from './user-input.service'

describe('UserInputService', () => {
  let service: UserInputService

  beforeEach(() => {
    service = new UserInputService()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('setValue', () => {
    it('should wrap specific keys in option_value and option_label', () => {
      const keys = [
        'first_name',
        'last_name',
        'primary_mobile_number',
        'primary_email',
        'dialCode',
        'marketing_acceptance_flag',
        'date_of_birth'
      ]

      keys.forEach(key => {
        service.setValue(key, 'testValue')
        expect(service.getValue(key)).toEqual({
          option_value: 'testValue',
          option_label: 'testValue'
        })
      })
    })

    it('should store other keys as plain values', () => {
      service.setValue('country', 'India')
      expect(service.getValue('country')).toBe('India')
    })
  })

  describe('getValue', () => {
    it('should return undefined if key not set', () => {
      expect(service.getValue('unknown')).toBeUndefined()
    })
  })

  describe('deleteValue', () => {
    it('should delete a specific key from formData', () => {
      service.setValue('first_name', 'Alice')
      service.deleteValue('first_name')
      expect(service.getValue('first_name')).toBeUndefined()
    })
  })

  describe('getAllValues', () => {
    it('should return a copy of all stored values', () => {
      service.setValue('first_name', 'John')
      service.setValue('country', 'India')

      const allValues = service.getAllValues()

      expect(allValues).toEqual({
        first_name: {
          option_value: 'John',
          option_label: 'John'
        },
        country: 'India'
      })
    })
  })

  describe('clearAll', () => {
    it('should reset formData but preserve demo credentials', () => {
      service.setValue('first_name', 'Test')
      service.setValue('demo_registered_email', 'test@example.com')
      service.setValue('demo_registered_password', 'Pass123!')
      service.clearAll()
      expect(service.getValue('first_name')).toBeUndefined()
      expect(service.getValue('demo_registered_email')).toBe('test@example.com')
      expect(service.getValue('demo_registered_password')).toBe('Pass123!')
    })

    it('should fully clear when no demo credentials exist', () => {
      service.setValue('first_name', 'Test')
      service.clearAll()
      expect(service.getAllValues()).toEqual({})
    })
  })

  describe('restoreSnapshot', () => {
    it('should restore form data from snapshot after clearAll', () => {
      service.setValue('first_name', 'John')
      service.setValue('last_name', 'Doe')
      service.setValue('demo_registered_email', 'john@example.com')
      service.setValue('demo_registered_password', 'Pass123!')
      service.clearAll()

      expect(service.getValue('first_name')).toBeUndefined()

      service.restoreSnapshot()

      expect(service.getValue('first_name')).toEqual({ option_value: 'John', option_label: 'John' })
      expect(service.getValue('last_name')).toEqual({ option_value: 'Doe', option_label: 'Doe' })
      expect(service.getValue('demo_registered_email')).toBe('john@example.com')
    })

    it('should remove cp_call_done after restore', () => {
      service.setValue('cp_call_done', 'true')
      service.setValue('demo_registered_email', 'test@example.com')
      service.setValue('demo_registered_password', 'Pass!')
      service.clearAll()
      service.restoreSnapshot()
      expect(service.getValue('cp_call_done')).toBeUndefined()
    })

    it('should do nothing if no snapshot exists', () => {
      service.setValue('first_name', 'Test')
      service.restoreSnapshot()
      expect(service.getValue('first_name')).toEqual({ option_value: 'Test', option_label: 'Test' })
    })
  })
})
