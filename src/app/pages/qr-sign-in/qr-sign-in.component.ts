import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { fetchAuthSession, signIn } from '@aws-amplify/auth'
import { sha1 } from 'js-sha1'
import { ValidatorService } from '../../common/utilities/validator.service'
import { CookieService } from 'ngx-cookie-service'
import { UserInputService } from 'src/app/common/api/services/user-input.service'
import { WIRService } from 'src/app/common/api/services/wir.service'
import { ProgressiveProfileQuestionsService } from 'src/app/common/api/services/progressive-profile-qsts.service'
import { ViewportScroller } from '@angular/common'
import { gtmImplementation } from 'src/app/common/api/services/gtmImplementation'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'app-qr-sign-in',
  templateUrl: './qr-sign-in.component.html',
  styleUrls: ['./qr-sign-in.component.css']
})
export class QrSignInComponent implements OnInit {
  isPasswordTextFieldType: boolean = false
  qrSigninForm: FormGroup
  submitted: boolean = false
  showLoader: any
  selectedLanguage: any
  questions: any
  wrongPassword: any
  userNotFound: any
  jwtTokenSignin: any
  userSigningIn: any = false
  maliciousUser: any

  constructor (
    public route: Router,
    public fb: FormBuilder,
    public validatorService: ValidatorService,
    public userInputService: UserInputService,
    public cookieService: CookieService,
    public wirService: WIRService,
    public viewPortScroller: ViewportScroller,
    public ProgressiveProfileQuestionsService: ProgressiveProfileQuestionsService,
    public gtmImplementation: gtmImplementation) {
    this.qrSigninForm = this.fb.group({
      primary_email: ['', [Validators.required, Validators.pattern(this.validatorService.isValidEmail())]],
      password: ['', Validators.required]
    })
  }

  togglePassword (): any{
    this.isPasswordTextFieldType = !this.isPasswordTextFieldType
  }

  ngOnInit (): any{
    this.viewPortScroller.scrollToPosition([0, 0])
    this.gtmImplementation.pageView('sign_in', 'anonymous_user', 'na')
    this.maliciousUser = localStorage.getItem('maliciousUser') ? localStorage.getItem('maliciousUser') : 'false'
    this.selectedLanguage = localStorage.getItem('languageSelected') ? localStorage.getItem('languageSelected') : 'EN'
    this.getProgressiveProfileQstns()
  }

  onInputString (field: string, event: FocusEvent): void {
    const inputElement = event.target as HTMLInputElement
    const value = inputElement.value
    this.userInputService.setValue(field, value)
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
    const storedInputData = this.userInputService.getAllValues()
    const patchValues: { [key: string]: any } = {}
    for (const key in storedInputData) {
      const value = storedInputData[key]
      if (key === 'primary_email') {
        patchValues[key] = value.option_value
      }
    }
    this.qrSigninForm.patchValue(patchValues)
  }

  async signInSubmit (): Promise<any> {
    this.submitted = true
    this.wrongPassword = false
    this.userNotFound = false
    this.userSigningIn = true
    const encryptedValue = sha1(this.qrSigninForm.value.primary_email)
    if (this.qrSigninForm.valid) {
      this.showLoader = true

      if (environment.demoMode) {
        const storedEmail = this.userInputService.getValue('demo_registered_email')
        const storedPassword = this.userInputService.getValue('demo_registered_password')
        if (storedEmail !== this.qrSigninForm.value.primary_email) {
          this.userNotFound = true
          this.showLoader = false
          this.userSigningIn = false
          return
        }
        if (storedPassword !== this.qrSigninForm.value.password) {
          this.wrongPassword = true
          this.showLoader = false
          this.userSigningIn = false
          return
        }
        // Demo mode: credentials match, simulate successful sign-in
        this.userInputService.restoreSnapshot()
        this.gtmImplementation.trackKPI('wir_signin_submit', 'signin', 'sign_in_button', 'user_signin', 'sign_in', 'signed_in_user')
        localStorage.setItem('isExistingUser', 'true')
        this.cookieService.set('jwtToken', 'demo-jwt-token')
        this.showLoader = false
        this.route?.navigateByUrl('/signupnew')
        return
      }

      await signIn({ username: encryptedValue, password: this.qrSigninForm.value.password })
        .then(async (user) => {
          this.gtmImplementation.trackKPI('wir_signin_submit', 'signin', 'sign_in_button', 'user_signin', 'sign_in', 'signed_in_user')
          localStorage.setItem('isExistingUser', 'true')
          await fetchAuthSession()
            .then((session: any) => {
              const accessToken = session.tokens.accessToken
              this.jwtTokenSignin = accessToken.toString()
              this.cookieService.set('jwtToken', this.jwtTokenSignin)
            })
            .catch((err: any) => {
              this.userSigningIn = false
              let redShieldError
              if (err.message === 'Rate exceeded') {
                redShieldError = JSON.parse(err.code)
              } else {
                redShieldError = false
              }
              if (redShieldError && redShieldError.code === 429) {
                localStorage.setItem('maliciousUser', 'true')
                localStorage.setItem('redShieldId', redShieldError.incident_id)
                this.maliciousUser = 'true'
              }
              console.log('Error fetching auth session:', err)
            })
          this.route?.navigateByUrl('/signupnew')
          this.showLoader = false
        }).catch((error) => {
          this.userSigningIn = false
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
          if (error.message === 'User does not exist.') {
            this.userNotFound = true
          } else if (error.message === 'Incorrect username or password.') {
            this.wrongPassword = true
          } else {
            console.log('Error in sign in:', error)
            this.route?.navigateByUrl('/error')
          }
          this.showLoader = false
        }
        )
    } else {
      this.userSigningIn = false
    }
  }
}
