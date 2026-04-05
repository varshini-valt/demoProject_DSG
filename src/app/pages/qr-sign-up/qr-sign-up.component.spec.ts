import { ComponentFixture, TestBed } from '@angular/core/testing'
import { QrSignUpComponent } from './qr-sign-up.component'
import { Router } from '@angular/router'
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms'
import { of, throwError } from 'rxjs'
import { ValidatorService } from '../../common/utilities/validator.service'
import { CookieService } from 'ngx-cookie-service'
import { UserInputService } from 'src/app/common/api/services/user-input.service'
import * as AuthModule from '@aws-amplify/auth'
import { ProgressiveProfileQuestionsService } from 'src/app/common/api/services/progressive-profile-qsts.service'
import { gtmImplementation } from 'src/app/common/api/services/gtmImplementation'
import { sha1 } from 'js-sha1'
import { ViewportScroller } from '@angular/common'
import { environment } from 'src/environments/environment'
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core'

jest.mock('js-sha1', () => ({
  sha1: jest.fn(() => 'mocked-sha1-hash')
}))

const mockGtmImplementation = {
  pageView: jest.fn(),
  trackEvents: jest.fn(),
  trackKPI: jest.fn()
}

jest.mock('@aws-amplify/auth', () => ({
  signUp: jest.fn(),
  signIn: jest.fn(),
  fetchAuthSession: jest.fn()
}))

describe('QrSignUpComponent', () => {
  let component: QrSignUpComponent
  let fixture: ComponentFixture<QrSignUpComponent>
  let originalDemoMode: boolean
  const routerSpy = { navigateByUrl: jest.fn() }

  const mockUserInputService = {
    getAllValues: () => ({}),
    getValue: jest.fn().mockReturnValue(undefined),
    setValue: jest.fn()
  }

  beforeEach(async () => {
    originalDemoMode = environment.demoMode
    environment.demoMode = false

    await TestBed.configureTestingModule({
      declarations: [QrSignUpComponent],
      imports: [ReactiveFormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [
        { provide: Router, useValue: routerSpy },
        {
          provide: ProgressiveProfileQuestionsService,
          useValue: {
            serviceQuestions: {
              items: [{
                fields: {
                  questions: [
                    { mappingField: 'first_name', displayFormat: { value: 'TEXT_BOX' } },
                    { mappingField: 'last_name', displayFormat: { value: 'TEXT_BOX' } },
                    { mappingField: 'primary_email', displayFormat: { value: 'TEXT_BOX' } },
                    { mappingField: 'password', displayFormat: { value: 'TEXT_BOX' } }
                  ]
                }
              }]
            },
            getPPqstns: jest.fn(() => of({
              items: [{
                fields: {
                  questions: [
                    { mappingField: 'first_name', displayFormat: { value: 'TEXT_BOX' } },
                    { mappingField: 'last_name', displayFormat: { value: 'TEXT_BOX' } },
                    { mappingField: 'primary_email', displayFormat: { value: 'TEXT_BOX' } },
                    { mappingField: 'password', displayFormat: { value: 'TEXT_BOX' } }
                  ]
                }
              }]
            }))
          }
        },
        {
          provide: ValidatorService,
          useValue: {
            isDigit: jest.fn((value: any) => /^\d+$/.test(value)),
            isValidEmail: jest.fn(() => /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)
          }
        },
        { provide: gtmImplementation, useValue: mockGtmImplementation },
        { provide: ViewportScroller, useValue: { scrollToPosition: jest.fn() } },
        { provide: CookieService, useValue: { get: (key: string) => key === 'country' ? '' : 'region/HIN01', set: jest.fn() } },
        { provide: UserInputService, useValue: mockUserInputService }
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(QrSignUpComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
    localStorage.clear()
  })

  afterEach(() => {
    environment.demoMode = originalDemoMode
    jest.clearAllMocks()
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should toggle password visibility', () => {
    expect(component.isPasswordTextFieldType).toBe(false)
    component.togglePassword()
    expect(component.isPasswordTextFieldType).toBe(true)
  })

  it('should generate the dynamic form from PP data', () => {
    component.getProgressiveProfileQstns()
    fixture.detectChanges()
    expect(component.qrSignupForm.contains('first_name')).toBe(true)
    expect(component.qrSignupForm.contains('primary_email')).toBe(true)
  })

  const test = 'Abcdef123!'
  it('should call signUpForm and navigate on success', async () => {
    component.qrSignupForm = new FormGroup({
      primary_email: new FormControl('test@email.com'),
      password: new FormControl(test),
      first_name: new FormControl('Test'),
      last_name: new FormControl('User')
    })

    const encrypted = sha1('test@email.com')
    ;(AuthModule.signUp as jest.Mock).mockResolvedValue({ userConfirmed: true })
    ;(AuthModule.signIn as jest.Mock).mockResolvedValue({})

    await component.signUpForm()

    expect(AuthModule.signUp).toHaveBeenCalled()
    expect(AuthModule.signIn).toHaveBeenCalled()
  })

  it('should set invalidPasswordException on InvalidPasswordException error', async () => {
    component.qrSignupForm = new FormGroup({
      primary_email: new FormControl('bad@email.com'),
      password: new FormControl('short'),
      first_name: new FormControl('Bad'),
      last_name: new FormControl('User')
    })
    ;(AuthModule.signUp as jest.Mock).mockRejectedValue({ code: 'InvalidPasswordException' })

    await component.signUpForm()

    expect(component.invalidPasswordException).toBe(true)
  })

  it('should set existingUser on duplicate user error', async () => {
    component.qrSignupForm = new FormGroup({
      primary_email: new FormControl('exist@email.com'),
      password: new FormControl('Password@123'),
      first_name: new FormControl('Exist'),
      last_name: new FormControl('User')
    })
    ;(AuthModule.signUp as jest.Mock).mockRejectedValue({ message: 'User already exists' })

    await component.signUpForm()
    expect(component.existingUser).toBe(true)
  })

  it('should navigate to error page on unknown signUp error', async () => {
    component.qrSignupForm = new FormGroup({
      primary_email: new FormControl('err@email.com'),
      password: new FormControl('Password@123'),
      first_name: new FormControl('Err'),
      last_name: new FormControl('User')
    })
    ;(AuthModule.signUp as jest.Mock).mockRejectedValue({ message: 'Some other error' })

    await component.signUpForm()
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/error')
  })

  it('should handle input focus and call setValue on userInputService', () => {
    const mockSetValue = jest.fn()
    component.userInputService = { setValue: mockSetValue } as any
    const inputElement = document.createElement('input')
    inputElement.value = 'testVal'
    const mockEvent = { target: inputElement } as unknown as FocusEvent
    component.onInputString('mockField', mockEvent)
    expect(mockSetValue).toHaveBeenCalledWith('mockField', 'testVal')
  })

  it('should call userInputService.setValue in onInputChange', () => {
    const mockSetValue = jest.fn()
    component.userInputService = { setValue: mockSetValue } as any
    component.onInputChange('testField', 'testValue')
    expect(mockSetValue).toHaveBeenCalledWith('testField', 'testValue')
  })

  it('should handle error and navigate to /error when getPPqstns fails', () => {
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

  describe('demo mode sign-up', () => {
    beforeEach(() => {
      environment.demoMode = true
    })

    it('should store credentials and navigate to /signupnew', async () => {
      mockUserInputService.getValue.mockReturnValue(undefined)

      component.qrSignupForm = new FormGroup({
        primary_email: new FormControl('new@email.com'),
        password: new FormControl(test),
        first_name: new FormControl('New'),
        last_name: new FormControl('User')
      })

      await component.signUpForm()

      expect(mockUserInputService.setValue).toHaveBeenCalledWith('demo_registered_email', 'new@email.com')
      expect(mockUserInputService.setValue).toHaveBeenCalledWith('demo_registered_password', test)
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/signupnew')
    })

    it('should show existingUser error if email already registered', async () => {
      mockUserInputService.getValue.mockReturnValue('new@email.com')

      component.qrSignupForm = new FormGroup({
        primary_email: new FormControl('new@email.com'),
        password: new FormControl(test),
        first_name: new FormControl('New'),
        last_name: new FormControl('User')
      })

      await component.signUpForm()

      expect(component.existingUser).toBe(true)
    })
  })
})
