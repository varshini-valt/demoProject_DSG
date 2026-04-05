import { Component, OnInit, Inject } from '@angular/core'
import { DOCUMENT, ViewportScroller } from '@angular/common'
import { Router } from '@angular/router'
import { FormBuilder, FormGroup, AbstractControl, Validators, ValidationErrors } from '@angular/forms'
import { confirmResetPassword, resetPassword } from '@aws-amplify/auth'
import { CookieService } from 'ngx-cookie-service'
import { sha1 } from 'js-sha1'
import { UserInputService } from 'src/app/common/api/services/user-input.service'
import { ProgressiveProfileQuestionsService } from 'src/app/common/api/services/progressive-profile-qsts.service'
import { gtmImplementation } from 'src/app/common/api/services/gtmImplementation'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'app-qr-forgot-password',
  templateUrl: './qr-forgot-password.component.html',
  styleUrls: ['./qr-forgot-password.component.css']
})
export class QrForgotPasswordComponent implements OnInit {
  isNewPasswordTextFieldType: boolean = false
  isConfirmNewPasswordTextFieldType: boolean = false
  forgetPasswordForm: FormGroup
  submitted: boolean = false
  mailSubmitted: boolean = false
  showLoader: any
  selectedLanguage: any
  questions: any
  userNotFound: boolean = false
  limitExceeded: boolean = false
  limitExceededEmail: boolean = false
  mailNotFound: boolean = false
  passwordCodeSentSuccessfully: boolean = false
  passwordNotMatching: boolean = false
  emailVerified: boolean = false
  resetPasswordDone: boolean = false
  invalidPasswordException: boolean = false
  invalidOtp: boolean = false
  maliciousUser: any

  constructor (
    public route: Router,
    public fb: FormBuilder,
    public cookieService: CookieService,
    public userInputService: UserInputService,
    public ProgressiveProfileQuestionsService: ProgressiveProfileQuestionsService,
    public viewPortScroller: ViewportScroller,
    @Inject(DOCUMENT) private document: Document,
    public gtmImplementation: gtmImplementation) {
    this.forgetPasswordForm = this.fb.group({
      primary_email: ['', [Validators.required, this.emailValidation, Validators.maxLength(250)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/[A-Z]/), Validators.pattern(/[a-z]/), Validators.pattern(/\d/), Validators.pattern(/[!@#$%^&*(),.?":{}|<>]/), this.noSpaceValidator]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/[A-Z]/), Validators.pattern(/[a-z]/), Validators.pattern(/\d/), Validators.pattern(/[!@#$%^&*(),.?":{}|<>]/), this.noSpaceValidator]],
      otpValues: this.fb.group({
        otpValue1: ['', Validators.required],
        otpValue2: ['', Validators.required],
        otpValue3: ['', Validators.required],
        otpValue4: ['', Validators.required],
        otpValue5: ['', Validators.required],
        otpValue6: ['', Validators.required]
      })
    })
  }

  ngOnInit (): any{
    this.viewPortScroller.scrollToPosition([0, 0])
    this.gtmImplementation.pageView('forgot_pwd_email_id', 'anonymous_user', 'na')
    this.maliciousUser = localStorage.getItem('maliciousUser') ? localStorage.getItem('maliciousUser') : 'false'
    this.getProgressiveProfileQstns()
  }

  getProgressiveProfileQstns (): any {
    this.questions = this.ProgressiveProfileQuestionsService.serviceQuestions?.items[0]?.fields?.questions
    if (this.questions === undefined) {
      this.showLoader = true
      this.ProgressiveProfileQuestionsService.getPPqstns().subscribe(
        (res: any) => {
          this.questions = res.items[0].fields.questions
          this.patchValues()
          this.showLoader = false
        },
        (error: any) => {
          console.log(error)
          this.showLoader = false
          this.route?.navigateByUrl('/error')
        }
      )
    } else {
      this.patchValues()
    }
  }

  patchValues (): any{
    const storedData = this.userInputService.getAllValues()

    const patchValues: { [key: string]: any } = {}
    for (const key in storedData) {
      const value = storedData[key]
      if (key === 'primary_email') {
        patchValues[key] = value.option_value
      }
    }
    this.forgetPasswordForm.patchValue(patchValues)
    this.showLoader = false
  }

  toggleNewPassword (): any{
    this.isNewPasswordTextFieldType = !this.isNewPasswordTextFieldType
  }

  toggleCofirmNewPassword (): any{
    this.isConfirmNewPasswordTextFieldType = !this.isConfirmNewPasswordTextFieldType
  }

  emailValidation (object: AbstractControl): { [key: string]: boolean } {
    const pattern = /^\w+([\.+-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,6})+$/
    return { emailerror: pattern.test(object.value) }
  }

  moveOtpCursor1 (id: string, event: { key: string }): any {
    if (event.key !== 'Tab') {
      const otpValues: any = this.forgetPasswordForm.value.otpValues
      const otpCode1 = otpValues.otpValue1
      const otpCode2 = otpValues.otpValue2
      const otpCode3 = otpValues.otpValue3
      const otpCode4 = otpValues.otpValue4
      const otpCode5 = otpValues.otpValue5
      if (id === 'otpValue1') {
        this.moveOtpCursor(otpCode1, 'otpValue2')
      } else if (id === 'otpValue2') {
        this.moveOtpCursor(otpCode2, 'otpValue3')
      } else if (id === 'otpValue3') {
        this.moveOtpCursor(otpCode3, 'otpValue4')
      } else if (id === 'otpValue4') {
        this.moveOtpCursor(otpCode4, 'otpValue5')
      } else if (id === 'otpValue5') {
        this.moveOtpCursor(otpCode5, 'otpValue6')
      }
    }
  }

  moveOtpCursor (otpCode1: string, id: string): any {
    if (otpCode1 !== ' ' && otpCode1 !== '') {
      this.document.getElementById(id)?.focus()
    }
  }

  moveOtpCursor2 (id2: string): any {
    const otpValues: any = this.forgetPasswordForm.value.otpValues
    const otpCode6 = otpValues.otpValue6
    if (id2 === 'otpValue5' && otpCode6 !== '') {
      this.document.getElementById('otpvalue6')?.focus()
    } else if (id2 === 'otpValue4' && otpValues.otpValue5 !== '') {
      this.document.getElementById('otpvalue5')?.focus()
    } else if (id2 === 'otpValue3' && otpValues.otpValue4 !== '') {
      this.document.getElementById('otpvalue4')?.focus()
    } else if (id2 === 'otpValue2' && otpValues.otpValue3 !== '') {
      this.document.getElementById('otpvalue3')?.focus()
    } else if (id2 === 'otpValue1' && otpValues.otpValue2 !== '') {
      this.document.getElementById('otpvalue2')?.focus()
    } else {
      this.document.getElementById(id2)?.focus()
    }
  }

  toSignIn (): any{
    this.route?.navigateByUrl('/qrSignin')
  }

  async verifyMailForgetPassword (): Promise<any> {
    this.mailSubmitted = true
    this.limitExceededEmail = false
    this.userNotFound = false
    this.emailVerified = false
    this.mailNotFound = false

    if (environment.demoMode) {
      // Demo mode: simulate OTP sent successfully
      this.showLoader = true
      setTimeout(() => {
        this.showLoader = false
        this.emailVerified = true
        this.gtmImplementation.pageView('forgot_pwd_otp_and_password', 'anonymous_user', 'na')
      }, 500)
      return
    }

    const encryptedValue = sha1(this.forgetPasswordForm.value.primary_email)
    this.showLoader = true
    await resetPassword({ username: encryptedValue })
      .then(async (user) => {
        this.showLoader = false
        this.emailVerified = true
        this.gtmImplementation.pageView('forgot_pwd_otp_and_password', 'anonymous_user', 'na')
      }).catch((error) => {
        let redShieldError
        if (error.message === 'Rate exceeded') {
          redShieldError = JSON.parse(error.code)
        } else {
          redShieldError = false
        }
        if (redShieldError && redShieldError.code === 429) {
          localStorage.setItem('maliciousUser', 'true')
          localStorage.setItem('redShieldId', redShieldError.incident_id)
          this.maliciousUser = 'true'
        }
        if (error.message === 'Attempt limit exceeded, please try after some time.') {
          this.limitExceededEmail = true
        } else if (error.message === 'Username/client id combination not found.') {
          this.userNotFound = true
        } else if (error.message === 'Cannot reset password for the user as there is no registered/verified email or phone_number') {
          this.mailNotFound = true
        } else {
          console.log('Error in reset password:', error)
        }
        this.showLoader = false
      }
      )
  }

  async resendPassCode (): Promise<any> {
    this.limitExceeded = false
    this.passwordCodeSentSuccessfully = false
    this.forgetPasswordForm.get('otpValues')?.reset()

    if (environment.demoMode) {
      // Demo mode: simulate passcode resent
      this.passwordCodeSentSuccessfully = true
      return
    }

    const encryptedValue = sha1(this.forgetPasswordForm.value.primary_email)
    await resetPassword({ username: encryptedValue })
      .then(() => {
        this.passwordCodeSentSuccessfully = true
      }).catch((error) => {
        let redShieldError
        if (error.message === 'Rate exceeded') {
          redShieldError = JSON.parse(error.code)
        } else {
          redShieldError = false
        }
        if (redShieldError && redShieldError.code === 429) {
          localStorage.setItem('maliciousUser', 'true')
          localStorage.setItem('redShieldId', redShieldError.incident_id)
          this.maliciousUser = 'true'
        }
        if (error.message === 'Attempt limit exceeded, please try after some time.') {
          this.limitExceeded = true
        } else {
          console.log('Error in resend passcode:', error)
        }
      })
  }

  async clickResetPassword (): Promise<any> {
    this.submitted = true
    this.passwordNotMatching = false
    this.invalidPasswordException = false
    this.invalidOtp = false
    this.limitExceeded = false
    this.resetPasswordDone = false

    const otpValues: any = this.forgetPasswordForm.value.otpValues
    const otpCode = otpValues.otpValue1 + otpValues.otpValue2 + otpValues.otpValue3 + otpValues.otpValue4 +
          otpValues.otpValue5 + otpValues.otpValue6

    if (this.forgetPasswordForm.value.password === this.forgetPasswordForm.value.confirmPassword) {

      if (environment.demoMode) {
        // Demo mode: simulate successful password reset
        this.userInputService.setValue('demo_registered_password', this.forgetPasswordForm.value.confirmPassword)
        this.showLoader = true
        setTimeout(() => {
          this.emailVerified = false
          this.resetPasswordDone = true
          this.showLoader = false
          this.gtmImplementation.pageView('forgot_pwd_success', 'anonymous_user', 'na')
        }, 500)
        return
      }

      const encryptedValue = sha1(this.forgetPasswordForm.value.primary_email)
      this.showLoader = true
      await confirmResetPassword({ username: encryptedValue, newPassword: this.forgetPasswordForm.value.confirmPassword, confirmationCode: otpCode }).then((status: any) => {
        this.emailVerified = false
        this.resetPasswordDone = true
        this.showLoader = false
        this.gtmImplementation.pageView('forgot_pwd_success', 'anonymous_user', 'na')
      }).catch((error) => {
        let redShieldError
        if (error.message === 'Rate exceeded') {
          redShieldError = JSON.parse(error.code)
        } else {
          redShieldError = false
        }
        if (redShieldError && redShieldError.code === 429) {
          localStorage.setItem('maliciousUser', 'true')
          localStorage.setItem('redShieldId', redShieldError.incident_id)
          this.maliciousUser = 'true'
        }
        if (error.code === 'InvalidPasswordException') {
          this.invalidPasswordException = true
        } else if (error.message === 'Invalid verification code provided, please try again.') {
          this.invalidOtp = true
        } else if (error.message === 'Attempt limit exceeded, please try after some time.') {
          this.limitExceeded = true
        } else {
          console.log('Error in confirm reset password:', error)
        }
        this.showLoader = false
      })
    } else {
      this.passwordNotMatching = true
    }
  }

  backToForgotPwd (): void{
    this.emailVerified = false
    this.resetPasswordDone = false
  }

  preventEnter (event: Event): void {
    const keyboardEvent = event as KeyboardEvent
    keyboardEvent.preventDefault()
    keyboardEvent.stopPropagation()
  }

  noSpaceValidator (control: AbstractControl): ValidationErrors | null {
    const value = control.value
    if (typeof value === 'string' && value.includes(' ')) {
      return { hasSpace: true }
    }
    return null
  }
}
