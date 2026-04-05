import { WIRService } from './wir.service'
import { HttpClient } from '@angular/common/http'
import { of } from 'rxjs'
import { CookieService } from 'ngx-cookie-service'
import { UuidServiceService } from './uuid-service'
import { UserInputService } from './user-input.service'
import { environment } from '../../../../environments/environment'

interface UserExistResponse {
  exists: boolean
}

interface RegistrationResponse {
  success: boolean
}

describe('WIRService', () => {
  let service: WIRService
  let httpClientMock: jest.Mocked<HttpClient>
  let cookieServiceMock: jest.Mocked<CookieService>
  let uuidServiceMock: jest.Mocked<UuidServiceService>
  let userInputServiceMock: jest.Mocked<UserInputService>

  beforeEach(() => {
    httpClientMock = {
      get: jest.fn(),
      post: jest.fn()
    } as any

    cookieServiceMock = {
      get: jest.fn()
    } as any

    uuidServiceMock = {
      uuidv4: jest.fn()
    } as any

    userInputServiceMock = {
      getValue: jest.fn(),
      setValue: jest.fn(),
      getAllValues: jest.fn(),
      deleteValue: jest.fn(),
      clearAll: jest.fn(),
      restoreSnapshot: jest.fn()
    } as any

    service = new WIRService(httpClientMock, cookieServiceMock, uuidServiceMock, userInputServiceMock)
  })

  it('should return mock data for isUserAlreadyExist in demoMode', (done) => {
    if (environment.demoMode) {
      service.isUserAlreadyExist('test@example.com', 'EN').subscribe((res: any) => {
        expect(res).toEqual({ student_already_exists: false })
        done()
      })
    } else {
      done()
    }
  })

  it('should check demo_registered_email for studentExistInCognito in demoMode', (done) => {
    if (environment.demoMode) {
      userInputServiceMock.getValue.mockReturnValue('test@example.com')
      service.studentExistInCognito('test@example.com').subscribe((res: any) => {
        expect(res).toEqual({ is_exists: true })
        done()
      })
    } else {
      done()
    }
  })

  it('should return is_exists false when email does not match in demoMode', (done) => {
    if (environment.demoMode) {
      userInputServiceMock.getValue.mockReturnValue('other@example.com')
      service.studentExistInCognito('test@example.com').subscribe((res: any) => {
        expect(res).toEqual({ is_exists: false })
        done()
      })
    } else {
      done()
    }
  })

  it('should return mock success for userRegistrationForm in demoMode', (done) => {
    if (environment.demoMode) {
      service.userRegistrationForm({ name: 'John' }).subscribe((res: any) => {
        expect(res.success).toBe(true)
        done()
      })
    } else {
      done()
    }
  })

  it('should call isUserAlreadyExist with proper headers and params when not demoMode', (done) => {
    if (!environment.demoMode) {
      const mockEmail = 'test@example.com'
      const mockLang = 'EN'
      const mockUuid = 'uuid-123'
      const expectedResponse: UserExistResponse = { exists: true }

      cookieServiceMock.get.mockReturnValue('')
      uuidServiceMock.uuidv4.mockReturnValue(mockUuid)
      httpClientMock.get.mockReturnValue(of(expectedResponse))

      service.isUserAlreadyExist(mockEmail, mockLang).subscribe((res: UserExistResponse) => {
        expect(res).toEqual(expectedResponse)
        expect(httpClientMock.get).toHaveBeenCalledWith(
          environment.isUserExistAPI,
          expect.objectContaining({
            headers: expect.anything(),
            params: expect.anything()
          })
        )
        done()
      })
    } else {
      done()
    }
  })

  it('should call studentExistInCognito with correct headers when not demoMode', (done) => {
    if (!environment.demoMode) {
      const mockUuid = 'uuid-789'
      const expectedResponse = { exists: true }

      uuidServiceMock.uuidv4.mockReturnValue(mockUuid)
      httpClientMock.get.mockReturnValue(of(expectedResponse))

      service.studentExistInCognito('test@example.com').subscribe((res: any) => {
        expect(res).toEqual(expectedResponse)
        done()
      })
    } else {
      done()
    }
  })

  it('should call userRegistrationForm with correct headers when not demoMode', (done) => {
    if (!environment.demoMode) {
      const userDetails = { name: 'John' }
      const mockUuid = 'uuid-456'
      const expectedResponse: RegistrationResponse = { success: true }

      cookieServiceMock.get.mockReturnValue('')
      uuidServiceMock.uuidv4.mockReturnValue(mockUuid)
      httpClientMock.post.mockReturnValue(of(expectedResponse))

      service.userRegistrationForm(userDetails).subscribe((res: RegistrationResponse) => {
        expect(res).toEqual(expectedResponse)
        done()
      })
    } else {
      done()
    }
  })
})
