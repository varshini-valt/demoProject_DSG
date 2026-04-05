import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing'
import { QrSignInComponent } from './qr-sign-in.component'
import { ReactiveFormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { ValidatorService } from '../../common/utilities/validator.service'
import { CookieService } from 'ngx-cookie-service'
import { UserInputService } from 'src/app/common/api/services/user-input.service'
import * as Auth from '@aws-amplify/auth'
import { WIRService } from 'src/app/common/api/services/wir.service'
import { ProgressiveProfileQuestionsService } from 'src/app/common/api/services/progressive-profile-qsts.service'
import { of, throwError } from 'rxjs'
import { gtmImplementation } from 'src/app/common/api/services/gtmImplementation'
import { environment } from 'src/environments/environment'
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core'
import { ViewportScroller } from '@angular/common'

jest.mock('js-sha1', () => ({
  sha1: jest.fn(() => 'mocked-sha1-hash')
}))

const mockGtmImplementation = {
  pageView: jest.fn(),
  trackEvents: jest.fn(),
  trackKPI: jest.fn()
}

describe('QrSignInComponent', () => {
  let component: QrSignInComponent
  let fixture: ComponentFixture<QrSignInComponent>
  let originalDemoMode: boolean

  const routerMock = { navigateByUrl: jest.fn() }
  const mockProgressiveProfileQuestionsService = {
    serviceQuestions: undefined as any,
    getPPqstns: jest.fn().mockReturnValue(of({
      items: [{ fields: { questions: [] } }]
    }))
  }
  const mockUserInputService = {
    setValue: jest.fn(),
    getAllValues: jest.fn().mockReturnValue({
      primary_email: { option_value: 'test@example.com' }
    }),
    getValue: jest.fn().mockReturnValue({ option_value: 'mockValue' }),
    restoreSnapshot: jest.fn()
  }
  const mockCookieService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'country') return 'India'
      if (key === 'officeId') return 'region/HIN01'
      return ''
    }),
    set: jest.fn()
  }
  const mockValidatorService = {
    isValidEmail: jest.fn().mockReturnValue(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  }

  beforeEach(async () => {
    originalDemoMode = environment.demoMode
    environment.demoMode = false

    await TestBed.configureTestingModule({
      declarations: [QrSignInComponent],
      imports: [ReactiveFormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: gtmImplementation, useValue: mockGtmImplementation },
        { provide: ValidatorService, useValue: mockValidatorService },
        { provide: CookieService, useValue: mockCookieService },
        { provide: UserInputService, useValue: mockUserInputService },
        { provide: ViewportScroller, useValue: { scrollToPosition: jest.fn() } },
        { provide: WIRService, useValue: { jwtTokenObj: { next: jest.fn() } } },
        { provide: ProgressiveProfileQuestionsService, useValue: mockProgressiveProfileQuestionsService }
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(QrSignInComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  afterEach(() => {
    environment.demoMode = originalDemoMode
    jest.clearAllMocks()
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  const test1 = 'Abcdef123!'

  it('should toggle password visibility', () => {
    expect(component.isPasswordTextFieldType).toBe(false)
    component.togglePassword()
    expect(component.isPasswordTextFieldType).toBe(true)
  })

  it('should call getProgressiveProfileQstns and patch form value', () => {
    const patchSpy = jest.spyOn(component, 'patchValues')
    component.getProgressiveProfileQstns()
    expect(patchSpy).toHaveBeenCalled()
  })

  it('should call userInputService.setValue on onInputString()', () => {
    const mockEvent = { target: { value: 'new@email.com' } } as any
    component.onInputString('primary_email', mockEvent)
    expect(mockUserInputService.setValue).toHaveBeenCalledWith('primary_email', 'new@email.com')
  })

  it('should handle "User does not exist" error', fakeAsync(async () => {
    jest.spyOn(Auth, 'signIn').mockRejectedValue({
      message: 'User does not exist.'
    })

    component.qrSigninForm.setValue({
      primary_email: 'test@example.com',
      password: test1
    })

    await component.signInSubmit()

    expect(component.userNotFound).toBe(true)
    expect(component.showLoader).toBe(false)
  }))

  it('functions', () => {
    component.ngOnInit()
    expect(component.selectedLanguage).toBe('EN')
  })

  it('should handle "Incorrect username or password" error', fakeAsync(async () => {
    jest.spyOn(Auth, 'signIn').mockRejectedValue({
      message: 'Incorrect username or password.'
    })

    component.qrSigninForm.setValue({
      primary_email: 'test@example.com',
      password: test1
    })

    await component.signInSubmit()

    expect(component.wrongPassword).toBe(true)
    expect(component.showLoader).toBe(false)
  }))

  it('should redirect to /error on unexpected error', fakeAsync(async () => {
    const error = new Error('Unknown error')
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(Auth, 'signIn').mockRejectedValue(error)

    component.qrSigninForm.setValue({
      primary_email: 'test@example.com',
      password: test1
    })

    await component.signInSubmit()

    expect(consoleSpy).toHaveBeenCalledWith('Error in sign in:', error)
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/error')
    consoleSpy.mockRestore()
  }))

  it('should handle successful signIn', fakeAsync(async () => {
    jest.spyOn(Auth, 'signIn').mockResolvedValue({ username: 'x' } as any)
    jest.spyOn(Auth, 'fetchAuthSession').mockResolvedValue({
      tokens: {
        accessToken: { toString: () => 'mockToken' }
      }
    } as any)

    component.qrSigninForm.setValue({
      primary_email: 'test@example.com',
      password: test1
    })

    await component.signInSubmit()

    expect(Auth.signIn).toHaveBeenCalled()
    expect(Auth.fetchAuthSession).toHaveBeenCalled()
    expect(mockCookieService.set).toHaveBeenCalledWith('jwtToken', 'mockToken')
    expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/signupnew')
  }))

  it('should handle error and navigate to /error when getPPqstns fails', () => {
    component.patchValues = jest.fn()
    component.ProgressiveProfileQuestionsService.serviceQuestions = undefined

    const errorResponse = { message: 'API failed' }
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

    jest.spyOn(component.ProgressiveProfileQuestionsService, 'getPPqstns')
      .mockReturnValue(throwError(() => errorResponse))
    component.getProgressiveProfileQstns()
    expect(component.showLoader).toBe(false)
    expect(consoleLogSpy).toHaveBeenCalledWith(errorResponse)

    consoleLogSpy.mockRestore()
  })

  it('should handle RedShield error from signIn with code 429', fakeAsync(async () => {
    const redShieldError = {
      message: 'Rate exceeded',
      code: JSON.stringify({ code: 429, incident_id: 'xyz789' })
    }

    jest.spyOn(Auth, 'signIn').mockRejectedValue(redShieldError)

    component.qrSigninForm.setValue({
      primary_email: 'test@example.com',
      password: test1
    })

    await component.signInSubmit()

    expect(localStorage.getItem('maliciousUser')).toBe('true')
    expect(localStorage.getItem('redShieldId')).toBe('xyz789')
    expect(component.maliciousUser).toBe('true')
  }))

  it('should not proceed if form is invalid', fakeAsync(async () => {
    component.qrSigninForm.setValue({
      primary_email: '',
      password: ''
    })

    await component.signInSubmit()
    expect(component.userSigningIn).toBe(false)
  }))

  it('should patch form values from storedData', () => {
    component.patchValues()
    expect(component.qrSigninForm.get('primary_email')?.value).toBe('test@example.com')
  })

  describe('demo mode sign-in', () => {
    beforeEach(() => {
      environment.demoMode = true
    })

    it('should show userNotFound when email does not match', fakeAsync(async () => {
      mockUserInputService.getValue.mockReturnValue('other@example.com')

      component.qrSigninForm.setValue({
        primary_email: 'test@example.com',
        password: test1
      })

      await component.signInSubmit()
      expect(component.userNotFound).toBe(true)
    }))

    it('should show wrongPassword when password does not match', fakeAsync(async () => {
      mockUserInputService.getValue.mockImplementation((key: string) => {
        if (key === 'demo_registered_email') return 'test@example.com'
        if (key === 'demo_registered_password') return 'WrongPass1!'
        return { option_value: 'mockValue' }
      })

      component.qrSigninForm.setValue({
        primary_email: 'test@example.com',
        password: test1
      })

      await component.signInSubmit()
      expect(component.wrongPassword).toBe(true)
    }))

    it('should navigate to /signupnew on correct credentials and restore snapshot', fakeAsync(async () => {
      mockUserInputService.getValue.mockImplementation((key: string) => {
        if (key === 'demo_registered_email') return 'test@example.com'
        if (key === 'demo_registered_password') return test1
        return { option_value: 'mockValue' }
      })

      component.qrSigninForm.setValue({
        primary_email: 'test@example.com',
        password: test1
      })

      await component.signInSubmit()
      expect(mockUserInputService.restoreSnapshot).toHaveBeenCalled()
      expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/signupnew')
    }))
  })
})
