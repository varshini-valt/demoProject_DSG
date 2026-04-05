import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing'
import { QrForgotPasswordComponent } from './qr-forgot-password.component'
import { Router } from '@angular/router'
import { ReactiveFormsModule } from '@angular/forms'
import { of, throwError } from 'rxjs'
import { DOCUMENT } from '@angular/common'
import { ProgressiveProfileQuestionsService } from 'src/app/common/api/services/progressive-profile-qsts.service'
import { UserInputService } from 'src/app/common/api/services/user-input.service'
import * as AmplifyAuth from '@aws-amplify/auth'
import { gtmImplementation } from 'src/app/common/api/services/gtmImplementation'
import { sha1 } from 'js-sha1'
import { environment } from 'src/environments/environment'

jest.mock('js-sha1', () => ({
  sha1: jest.fn(() => 'mocked-sha1-hash')
}))

const mockGtmImplementation = {
  pageView: jest.fn(),
  trackEvents: jest.fn(),
  trackKPI: jest.fn()
}

jest.spyOn(AmplifyAuth, 'confirmResetPassword').mockResolvedValue(undefined)

const mockUserInputService = {
  getAllValues: jest.fn().mockReturnValue({
    primary_email: { option_value: 'test@example.com' },
    first_name: { option_value: 'John' }
  }),
  getValue: jest.fn((key: string) => {
    if (key === 'cookies') return 'true'
    return { option_label: 'true' }
  }),
  setValue: jest.fn()
}

const ProgressiveProfileQuestionsServiceMock = {
  serviceQuestions: {
    items: [
      { fields: { questions: [] } }
    ]
  },
  ppQuestionsData: of({}),
  getPPqstns: jest.fn().mockReturnValue(of({
    items: [{ fields: { questions: [] } }]
  }))
}

describe('QrForgotPasswordComponent', () => {
  let component: QrForgotPasswordComponent
  let fixture: ComponentFixture<QrForgotPasswordComponent>
  const mockRouter = { navigateByUrl: jest.fn() }
  let originalDemoMode: boolean

  beforeEach(async () => {
    originalDemoMode = environment.demoMode
    environment.demoMode = false
    await TestBed.configureTestingModule({
      declarations: [QrForgotPasswordComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: gtmImplementation, useValue: mockGtmImplementation },
        { provide: Router, useValue: mockRouter },
        { provide: ProgressiveProfileQuestionsService, useValue: ProgressiveProfileQuestionsServiceMock },
        { provide: DOCUMENT, useValue: document },
        { provide: UserInputService, useValue: mockUserInputService }
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(QrForgotPasswordComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  afterEach(() => {
    environment.demoMode = originalDemoMode
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('functions', () => {
    expect(component.isNewPasswordTextFieldType).toBe(false)
    component.toggleNewPassword()
    expect(component.isNewPasswordTextFieldType).toBe(true)

    expect(component.isConfirmNewPasswordTextFieldType).toBe(false)
    component.toggleCofirmNewPassword()
    expect(component.isConfirmNewPasswordTextFieldType).toBe(true)

    component.getProgressiveProfileQstns()

    component.toSignIn()

    component.emailVerified = true
    component.resetPasswordDone = true
    component.backToForgotPwd()
    expect(component.emailVerified).toBe(false)
    expect(component.resetPasswordDone).toBe(false)

    component.moveOtpCursor1('otpValue1', { key: '1' })
    component.moveOtpCursor1('otpValue2', { key: '1' })
    component.moveOtpCursor1('otpValue3', { key: '1' })
    component.moveOtpCursor1('otpValue4', { key: '1' })
    component.moveOtpCursor1('otpValue5', { key: '1' })
    component.moveOtpCursor('1', '1')
    component.moveOtpCursor2('otpValue5')

    component.forgetPasswordForm.get('otpValues.otpValue6')?.setValue('6')
    component.moveOtpCursor2('otpValue5')

    component.forgetPasswordForm.get('otpValues.otpValue5')?.setValue('6')
    component.moveOtpCursor2('otpValue4')

    component.forgetPasswordForm.get('otpValues.otpValue4')?.setValue('6')
    component.moveOtpCursor2('otpValue3')

    component.forgetPasswordForm.get('otpValues.otpValue3')?.setValue('6')
    component.moveOtpCursor2('otpValue2')

    component.forgetPasswordForm.get('otpValues.otpValue2')?.setValue('6')
    component.moveOtpCursor2('otpValue1')

    component.verifyMailForgetPassword()
    component.resendPassCode()
  })

  const test1 = 'Abcdef123!'
  const test2 = 'Different1!'
  it('should set passwordNotMatching true when passwords mismatch', fakeAsync(() => {
    component.forgetPasswordForm.patchValue({
      password: test1,
      confirmPassword: test2
    })
    component.clickResetPassword()
    expect(component.passwordNotMatching).toBe(true)
  }))

  it('should set passwordNotMatching false when passwords did not mismatch', fakeAsync(() => {
    component.forgetPasswordForm.patchValue({
      password: test1,
      confirmPassword: test1
    })
    component.clickResetPassword()
    expect(component.passwordNotMatching).toBe(false)
  }))

  it('should call confirmResetPassword and set resetPasswordDone', async () => {
    component.forgetPasswordForm.patchValue({
      primary_email: 'test@example.com',
      password: test1,
      confirmPassword: test1,
      otpValues: {
        otpValue1: '1',
        otpValue2: '2',
        otpValue3: '3',
        otpValue4: '4',
        otpValue5: '5',
        otpValue6: '6'
      }
    })

    await component.clickResetPassword()

    expect(AmplifyAuth.confirmResetPassword).toHaveBeenCalledWith({
      username: sha1('test@example.com'),
      newPassword: test1,
      confirmationCode: '123456'
    })
    expect(component.resetPasswordDone).toBe(true)
    expect(component.showLoader).toBe(false)
  })

  it('should handle error in confirmResetPassword', async () => {
    const error = new Error('Reset failed')
    jest.spyOn(AmplifyAuth, 'confirmResetPassword').mockRejectedValue(error)

    component.forgetPasswordForm.patchValue({
      primary_email: 'test@example.com',
      password: test1,
      confirmPassword: test1,
      otpValues: {
        otpValue1: '1',
        otpValue2: '2',
        otpValue3: '3',
        otpValue4: '4',
        otpValue5: '5',
        otpValue6: '6'
      }
    })

    await component.clickResetPassword()

    expect(component.resetPasswordDone).toBe(false)
    expect(component.showLoader).toBe(false)
  })

  it('should handle unknown error gracefully', async () => {
    const error = { message: 'Something went wrong', code: 'UnknownError' }
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(AmplifyAuth, 'confirmResetPassword').mockRejectedValue(error)

    component.forgetPasswordForm.patchValue({
      primary_email: 'test@example.com',
      password: test1,
      confirmPassword: test1,
      otpValues: {
        otpValue1: '1',
        otpValue2: '2',
        otpValue3: '3',
        otpValue4: '4',
        otpValue5: '5',
        otpValue6: '6'
      }
    })

    await component.clickResetPassword()

    expect(component.showLoader).toBe(false)
    expect(console.log).toHaveBeenCalledWith('Error in confirm reset password:', error)
  })

  it('should set limitExceeded to true when attempt limit exceeded', async () => {
    const error = { message: 'Attempt limit exceeded, please try after some time.' }
    jest.spyOn(AmplifyAuth, 'confirmResetPassword').mockRejectedValue(error)

    component.forgetPasswordForm.patchValue({
      primary_email: 'test@example.com',
      password: test1,
      confirmPassword: test1,
      otpValues: {
        otpValue1: '1',
        otpValue2: '2',
        otpValue3: '3',
        otpValue4: '4',
        otpValue5: '5',
        otpValue6: '6'
      }
    })

    await component.clickResetPassword()

    expect(component.limitExceeded).toBe(true)
    expect(component.showLoader).toBe(false)
  })

  it('should set invalidOtp to true when verification code is invalid', async () => {
    const error = { message: 'Invalid verification code provided, please try again.' }
    jest.spyOn(AmplifyAuth, 'confirmResetPassword').mockRejectedValue(error)

    component.forgetPasswordForm.patchValue({
      primary_email: 'test@example.com',
      password: test1,
      confirmPassword: test1,
      otpValues: {
        otpValue1: '1',
        otpValue2: '2',
        otpValue3: '3',
        otpValue4: '4',
        otpValue5: '5',
        otpValue6: '6'
      }
    })

    await component.clickResetPassword()

    expect(component.invalidOtp).toBe(true)
    expect(component.showLoader).toBe(false)
  })

  it('should set invalidPasswordException to true when password is invalid', async () => {
    const error = { code: 'InvalidPasswordException' }
    jest.spyOn(AmplifyAuth, 'confirmResetPassword').mockRejectedValue(error)

    component.forgetPasswordForm.patchValue({
      primary_email: 'test@example.com',
      password: test1,
      confirmPassword: test1,
      otpValues: {
        otpValue1: '1',
        otpValue2: '2',
        otpValue3: '3',
        otpValue4: '4',
        otpValue5: '5',
        otpValue6: '6'
      }
    })

    await component.clickResetPassword()

    expect(component.invalidPasswordException).toBe(true)
    expect(component.showLoader).toBe(false)
  })

  it('should patch values from userInputService.getAllValues and match options', () => {
    const storedData = component.userInputService.getAllValues()
    const patchValues: { [key: string]: any } = {}

    for (const key in storedData) {
      const value = storedData[key]
      if (key === 'primary_email') {
        patchValues[key] = value.option_value
      }
    }

    expect(patchValues).toEqual({
      primary_email: 'test@example.com'
    })
  })

  it('should fetch questions via API when serviceQuestions is undefined', () => {
    component.patchValues = jest.fn()
    component.ProgressiveProfileQuestionsService.serviceQuestions = undefined
    component.getProgressiveProfileQstns()
  })

  it('should handle error and navigate to /error when getPPqstns fails', () => {
    component.patchValues = jest.fn()
    component.ProgressiveProfileQuestionsService.serviceQuestions = undefined

    const errorResponse = { message: 'API failed' }
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    const navigateSpy = jest.spyOn(component.route, 'navigateByUrl')

    jest.spyOn(component.ProgressiveProfileQuestionsService, 'getPPqstns')
      .mockReturnValue(throwError(() => errorResponse))
    component.getProgressiveProfileQstns()
    expect(component.showLoader).toBe(false)
    expect(consoleLogSpy).toHaveBeenCalledWith(errorResponse)
    expect(navigateSpy).toHaveBeenCalledWith('/error')

    consoleLogSpy.mockRestore()
  })

  it('should call preventDefault and stopPropagation on preventEnter', () => {
    const mockEvent = {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn()
    } as unknown as KeyboardEvent

    component.preventEnter(mockEvent)

    expect(mockEvent.preventDefault).toHaveBeenCalled()
    expect(mockEvent.stopPropagation).toHaveBeenCalled()
  })

  it('should detect RedShield (429) in verifyMailForgetPassword', async () => {
    const redShieldError = {
      message: 'Rate exceeded',
      code: JSON.stringify({ code: 429, incident_id: 'xyz123' })
    }

    jest.spyOn(AmplifyAuth, 'resetPassword').mockRejectedValue(redShieldError)

    component.forgetPasswordForm.patchValue({
      primary_email: 'test@example.com'
    })

    await component.verifyMailForgetPassword()

    expect(localStorage.getItem('maliciousUser')).toBe('true')
    expect(localStorage.getItem('redShieldId')).toBe('xyz123')
    expect(component.maliciousUser).toBe('true')
  })

  it('should detect RedShield (429) in resendPassCode', async () => {
    const redShieldError = {
      message: 'Rate exceeded',
      code: JSON.stringify({ code: 429, incident_id: 'red123' })
    }

    jest.spyOn(AmplifyAuth, 'resetPassword').mockRejectedValue(redShieldError)

    component.forgetPasswordForm.patchValue({
      primary_email: 'test@example.com'
    })

    await component.resendPassCode()

    expect(localStorage.getItem('maliciousUser')).toBe('true')
    expect(localStorage.getItem('redShieldId')).toBe('red123')
    expect(component.maliciousUser).toBe('true')
  })

  it('should detect RedShield (429) in clickResetPassword', async () => {
    const redShieldError = {
      message: 'Rate exceeded',
      code: JSON.stringify({ code: 429, incident_id: 'rst429' })
    }

    jest.spyOn(AmplifyAuth, 'confirmResetPassword').mockRejectedValue(redShieldError)

    const test = 'Abcd1234!'
    component.forgetPasswordForm.patchValue({
      primary_email: 'test@example.com',
      password: test,
      confirmPassword: test,
      otpValues: {
        otpValue1: '1',
        otpValue2: '2',
        otpValue3: '3',
        otpValue4: '4',
        otpValue5: '5',
        otpValue6: '6'
      }
    })

    await component.clickResetPassword()

    expect(localStorage.getItem('maliciousUser')).toBe('true')
    expect(localStorage.getItem('redShieldId')).toBe('rst429')
    expect(component.maliciousUser).toBe('true')
  })
})
