import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms'
import { signUp, signIn, fetchAuthSession } from '@aws-amplify/auth'
import { sha1 } from 'js-sha1'
import { ValidatorService } from '../../common/utilities/validator.service'
import { CookieService } from 'ngx-cookie-service'
import { UserInputService } from 'src/app/common/api/services/user-input.service'
import { ProgressiveProfileQuestionsService } from 'src/app/common/api/services/progressive-profile-qsts.service'
import { ViewportScroller } from '@angular/common'
import { gtmImplementation } from 'src/app/common/api/services/gtmImplementation'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'app-qr-sign-up',
  templateUrl: './qr-sign-up.component.html',
  styleUrls: ['./qr-sign-up.component.css']
})
export class QrSignUpComponent implements OnInit{
  isPasswordTextFieldType: boolean = false
  qrSignupForm: FormGroup
  submitted: boolean = false
  showLoader: any
  selectedLanguage: any
  questions: any
  invalidPasswordException: any
  existingUser: any
  jwtTokenSignup: any
  ppResponse: any
  userSigningUp: boolean = false
  maliciousUser: any

  togglePassword (): any {
    this.isPasswordTextFieldType = !this.isPasswordTextFieldType
  }

  constructor (
    public route: Router,
    public fb: FormBuilder,
    public validatorService: ValidatorService,
    public userInputService: UserInputService,
    public cookieService: CookieService,
    public ProgressiveProfileQuestionsService: ProgressiveProfileQuestionsService,
    public viewPortScroller: ViewportScroller,
    public gtmImplementation: gtmImplementation) {
    this.qrSignupForm = this.fb.group({
    })
  }

  ngOnInit (): any{
    this.viewPortScroller.scrollToPosition([0, 0])
    this.maliciousUser = localStorage.getItem('maliciousUser') ? localStorage.getItem('maliciousUser') : 'false'
      this.gtmImplementation.pageView('sign_up', 'anonymous_user', 'na')
    this.getProgressiveProfileQstns()
  }

  onInputString (field: string, event: FocusEvent): void {
    const inputElement = event.target as HTMLInputElement
    const trimmedValue = inputElement.value.trim()

    inputElement.value = trimmedValue
    this.userInputService.setValue(field, trimmedValue)
    this.qrSignupForm.get(field)?.setValue(trimmedValue)
  }

  onInputChange (field: string, value: any): any {
    this.userInputService.setValue(field, value)
  }

  getProgressiveProfileQstns (): any {
    this.ppResponse = this.ProgressiveProfileQuestionsService.serviceQuestions
    if (this.ppResponse === undefined) {
      this.showLoader = true
      this.ProgressiveProfileQuestionsService.getPPqstns().subscribe(
        (res: any) => {
          this.questions = res.items[0].fields.questions
          this.getRegistrationForm(res)
          this.showLoader = false
        },
        (error: any) => {
          console.log(error)
          this.showLoader = false
          this.route?.navigateByUrl('/error')
        }
      )
    } else {
      this.getRegistrationForm(this.ppResponse)
    }
  }

  getRegistrationForm (ppQuestions: any): any {
    ppQuestions.items[0].fields.questions.forEach((data: any) => {
      if (data.mappingField === 'marketing_acceptance_flag.acceptPhoneCall, marketing_acceptance_flag.acceptEmail, marketing_acceptance_flag.acceptSms') {
        data.mappingField = 'marketing_acceptance_flag'
      }
      if (data.mappingField === 'termsAndConditionsAcceptance') {
        if (data.label.includes('PICS_LINK_HREF')) {
          const linkURL = "<a href='[URL]' target='_blank'>"
          const termsLink = linkURL.replace('[URL]', data.termsURL)
          const privacyLink = linkURL.replace('[URL]', data.privacyURL)
          const picsLink = linkURL.replace('[URL]', data.picsURL)
          data.label = data.label.replace('TERMS_LINK_HREF', termsLink)
          data.label = data.label.replace('PRIVACY_LINK_HREF', privacyLink)
          data.label = data.label.replace('PICS_LINK_HREF', picsLink)
          data.label = data.label.replaceAll('LINK_ATAG', '</a>')
        } else {
          const linkURL = "<a href='[URL]' target='_blank'>"
          const termsLink = linkURL.replace('[URL]', data.termsURL)
          const privacyLink = linkURL.replace('[URL]', data.privacyURL)
          data.label = data.label.replace('TERMS_LINK_HREF', termsLink)
          data.label = data.label.replace('PRIVACY_LINK_HREF', privacyLink)
          data.label = data.label.replaceAll('LINK_ATAG', '</a>')
        }
      }
    })
    this.questions = ppQuestions.items[0].fields.questions
    this.generateFormControl(ppQuestions.items[0].fields.questions)
  }

  generateFormControl (ppQuestions: any): any {
    const formControl: any = {}
    if (ppQuestions) {
      ppQuestions.forEach((element: any) => {
        if (element.displayFormat.value === 'CHECKBOX' && element.mappingField !== 'marketing_acceptance_flag') {
          formControl[element.mappingField] = new FormControl('', [(control) => {
            return !control.value ? { 'required': true } : null
          }])
        } else if (element.displayFormat.value === 'CHECKBOX' && element.mappingField === 'marketing_acceptance_flag') {
          formControl[element.mappingField] = new FormControl(false)
        } else if (element.displayFormat.value === 'TEXT_BOX') {
          if (element.mappingField === 'first_name' || element.mappingField === 'last_name') {
            formControl[element.mappingField] = new FormControl('', Validators.required)
          } else if (element.mappingField === 'primary_email') {
            formControl[element.mappingField] = new FormControl('', [Validators.required, Validators.pattern(this.validatorService.isValidEmail())])
          } else if (element.mappingField === 'password') {
            formControl[element.mappingField] = new FormControl('', [Validators.required, Validators.minLength(8), Validators.pattern(/[A-Z]/), Validators.pattern(/[a-z]/), Validators.pattern(/\d/), Validators.pattern(/[!@#$%^&*(),.?":{}|<>]/), this.noSpaceValidator])
          }
        }
      })
    }
    this.qrSignupForm = new FormGroup(formControl)
    const storedData = this.userInputService.getAllValues()
    const patchValues: { [key: string]: any } = {}
    for (const key in storedData) {
      const value = storedData[key]
      patchValues[key] = value?.option_value
    }

    this.qrSignupForm.patchValue(patchValues)
    this.showLoader = false
  }

  async signUpForm (): Promise<any> {
    this.userSigningUp = true
    this.submitted = true
    this.invalidPasswordException = false
    this.existingUser = false
    if (this.qrSignupForm.valid) {
      this.showLoader = true

      if (environment.demoMode) {
        const storedEmail = this.userInputService.getValue('demo_registered_email')
        if (storedEmail === this.qrSignupForm.value.primary_email) {
          this.existingUser = true
          this.showLoader = false
          this.userSigningUp = false
          return
        }
        // Demo mode: store credentials and simulate successful sign-up
        this.userInputService.setValue('demo_registered_email', this.qrSignupForm.value.primary_email)
        this.userInputService.setValue('demo_registered_password', this.qrSignupForm.value.password)
        localStorage.setItem('isExistingUser', 'false')
        this.gtmImplementation.trackKPI('wir_signup_submit', 'signup', 'sign_up_button', 'user_signup', 'sign_up', 'signed_in_user')
        this.cookieService.set('jwtToken', 'demo-jwt-token')
        this.showLoader = false
        this.route?.navigateByUrl('/signupnew')
        return
      }

      const encryptedValue = sha1(this.qrSignupForm.value.primary_email)
      await signUp({
        username: encryptedValue,
        password: this.qrSignupForm.value.password,
        options: {
          userAttributes: {
            email: this.qrSignupForm.value.primary_email,
            name: this.qrSignupForm.value.first_name,
            nickname: this.qrSignupForm.value.last_name
          }
        }
      }).then(async (signUpResult) => {
        await signIn({ username: encryptedValue, password: this.qrSignupForm.value.password })
          .then(async (user) => {
            localStorage.setItem('isExistingUser', 'false')
            this.gtmImplementation.trackKPI('wir_signup_submit', 'signup', 'sign_up_button', 'user_signup', 'sign_up', 'signed_in_user')
            await fetchAuthSession()
              .then((session: any) => {
                const accessToken = session.tokens.accessToken
                this.jwtTokenSignup = accessToken.toString()
                this.cookieService.set('jwtToken', this.jwtTokenSignup)
              })
              .catch((err: any) => {
                this.userSigningUp = false
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
            this.userSigningUp = false
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
            console.log('Error in sign in:', error)
            this.route?.navigateByUrl('/error')
            this.showLoader = false
          }
          )
        this.showLoader = false
      }).catch(async (error) => {
        this.userSigningUp = false
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
        } else if (error.message === 'User already exists') {
          this.existingUser = true
        } else {
          console.log('Error in sign up:', error)
          this.route?.navigateByUrl('/error')
        }
        this.showLoader = false
      })
    } else {
      this.userSigningUp = false
    }
  }

  noSpaceValidator (control: AbstractControl): ValidationErrors | null {
    const value = control.value
    if (typeof value === 'string' && value.includes(' ')) {
      return { hasSpace: true }
    }
    return null
  }
}
