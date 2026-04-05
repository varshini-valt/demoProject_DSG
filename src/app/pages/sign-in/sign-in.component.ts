import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { WIRService } from '../../common/api/services/wir.service'
import { languageContent } from '../../common/json/sign-in-content'
import { ValidatorService } from '../../common/utilities/validator.service'
import { CookieService } from 'ngx-cookie-service'
import { UserInputService } from 'src/app/common/api/services/user-input.service'
import { ProgressiveProfileQuestionsService } from 'src/app/common/api/services/progressive-profile-qsts.service'
import { ViewportScroller } from '@angular/common'
import { gtmImplementation } from 'src/app/common/api/services/gtmImplementation'

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {
  signInFormGroup: FormGroup
  questions: any
  submitted: boolean = false
  selectedLanguage: any
  welcomeHeading: any
  nextButton: any
  enterEmail: any
  defaultLanguage = 'EN'
  showLoader: any
  countryCode: any
  maliciousUser: any

  constructor (
    public formBuilder: FormBuilder,
    private WIRService: WIRService,
    private route: Router,
    public validatorService: ValidatorService,
    public userInputService: UserInputService,
    public cookieService: CookieService,
    public viewPortScroller: ViewportScroller,
    public ProgressiveProfileQuestionsService: ProgressiveProfileQuestionsService,
    public gtmImplementation: gtmImplementation
  ) {
    this.signInFormGroup = this.formBuilder.group({
      emailAddress: ['', [Validators.required, Validators.pattern(this.validatorService.isValidEmail())]]
    })
  }

  ngOnInit (): void {
    this.viewPortScroller.scrollToPosition([0, 0])
    this.maliciousUser = localStorage.getItem('maliciousUser') ? localStorage.getItem('maliciousUser') : 'false'
    this.showLoader = true
    sessionStorage.clear()
    localStorage.clear()
    this.userInputService.clearAll()
    this.cookieService.delete('wirCounsellorTeam')
    this.cookieService.delete('jwtToken')
    this.countryCode = this.cookieService.get('countrycode')
    localStorage.setItem('detailsPage', 'false')
    this.selectedLanguage = localStorage.getItem('languageSelected') ? localStorage.getItem('languageSelected') : 'EN'
    this.getLanguageContent(this.selectedLanguage)
    this.getProgressiveProfileQstns()
  }

  getProgressiveProfileQstns (): any {
    this.ProgressiveProfileQuestionsService.getPPqstns().subscribe(
      (res: any) => {
        this.questions = res.items[0].fields.questions
        this.gtmImplementation.pageView('email_page', 'anonymous_user', 'na')
        this.showLoader = false
      },
      (error: any) => {
        console.log(error)
        this.showLoader = false
        this.route?.navigateByUrl('/error')
      }
    )
  }

  onInputString (field: string, event: FocusEvent): void {
    const inputElement = event.target as HTMLInputElement
    const value = inputElement.value
    this.userInputService.setValue(field, value)
  }

  languageChanged (event: any): any {
    this.questions = ''
    this.selectedLanguage = event.value
    this.getLanguageContent(event.value)
    localStorage.setItem('languageSelected', this.selectedLanguage)
    this.ProgressiveProfileQuestionsService.getPPqstns()
  }

  getLanguageContent (language: any): any {
    if (language === this.defaultLanguage) {
      this.welcomeHeading = languageContent[language]?.headingValue
      this.nextButton = languageContent[language]?.buttonValue
      this.enterEmail = languageContent[language]?.enterEmail
    } else {
      this.welcomeHeading = languageContent[this.countryCode + '_' + language]?.headingValue
      this.nextButton = languageContent[this.countryCode + '_' + language]?.buttonValue
      this.enterEmail = languageContent[this.countryCode + '_' + language]?.enterEmail
    }
  }

  nextpage (): any {
    this.submitted = true
    if (this.signInFormGroup.valid) {
      this.showLoader = true
      this.WIRService.studentExistInCognito(this.signInFormGroup.value.emailAddress).subscribe((user: any) => {
        this.gtmImplementation.trackEvents('wir_enter_email', 'next_button', 'next', 'email_page', 'anonymous_user', 'na')
        if (user.is_exists === false){
          this.showLoader = false
          this.route?.navigateByUrl('/qrSignup')
        } else {
          this.showLoader = false
          this.route?.navigateByUrl('/qrSignin')
        }
      })
    }
  }
}
