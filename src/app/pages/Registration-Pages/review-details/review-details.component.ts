import { Component, EventEmitter, OnInit, Output } from '@angular/core'
import { UserInputService } from 'src/app/common/api/services/user-input.service'
import { Router } from '@angular/router'
import { CookieService } from 'ngx-cookie-service'
import { WIRService } from 'src/app/common/api/services/wir.service'
import { ProgressiveProfileQuestionsService } from 'src/app/common/api/services/progressive-profile-qsts.service'
import { ViewportScroller } from '@angular/common'
import { gtmImplementation } from 'src/app/common/api/services/gtmImplementation'

@Component({
  selector: 'app-review-details',
  templateUrl: './review-details.component.html',
  styleUrls: ['./review-details.component.css']
})
export class ReviewDetailsComponent implements OnInit{
  selectedLanguage: any
  showLoader: any
  questions: any
  country: any
  officeId: any
  phoneNumber: any
  countryCode: any
  dialcode: any
  marketingAcceptanceIndicator: boolean = false

  allData: { [key: string]: any } = {}
  @Output() backClicked = new EventEmitter<void>()

  constructor (private userInputService: UserInputService,
    public cookieService: CookieService,
    public wirService: WIRService,
    public route: Router,
    public ProgressiveProfileQuestionsService: ProgressiveProfileQuestionsService,
    public viewPortScroller: ViewportScroller,
    public gtmImplementation: gtmImplementation
  ) {}

  ngOnInit (): void {
    this.viewPortScroller.scrollToPosition([0, 0])
    this.gtmImplementation.pageView('review_details', 'signed_in_user', 'user_registration')
    this.allData = this.userInputService.getAllValues()
    if (typeof (this.userInputService.getValue('dialCode')?.option_label) === 'string') {
      this.dialcode = this.userInputService.getValue('dialCode')?.option_label
    } else {
      this.dialcode = this.userInputService.getValue('dialCode')?.option_label.dialCode
    }
    this.phoneNumber = this.dialcode + ' ' + this.userInputService.getValue('primary_mobile_number')?.option_label
    this.country = this.cookieService.get('country')
    this.countryCode = this.cookieService.get('countrycode')
    if (this.userInputService.getValue('marketing_acceptance_flag')?.option_value !== undefined) {
      this.marketingAcceptanceIndicator = this.userInputService.getValue('marketing_acceptance_flag')?.option_value
    }
    this.selectedLanguage = localStorage.getItem('languageSelected') ? localStorage.getItem('languageSelected') : 'EN'
    this.getProgressiveProfileQstns()
  }

  getProgressiveProfileQstns (): any {
    this.questions = this.ProgressiveProfileQuestionsService.serviceQuestions?.items[0]?.fields?.questions
    if (this.questions === undefined) {
      this.showLoader = true
      this.ProgressiveProfileQuestionsService.getPPqstns().subscribe(
        (res: any) => {
          this.questions = res.items[0].fields.questions
          this.showLoader = false
        },
        (error: any) => {
          console.log(error)
          this.showLoader = false
          this.route?.navigateByUrl('/error')
        }
      )
    }
  }

  backButton (): void {
    this.gtmImplementation.trackEvents('wir_review_details', 'back_button', 'back', 'review_details', 'signed_in_user', 'user_registration')
    this.backClicked.emit()
  }

  submitRegistrationForm (): any {
    this.showLoader = true
    const payload = {
      firstName: this.userInputService.getValue('first_name')?.option_value,
      lastName: this.userInputService.getValue('last_name')?.option_value,
      studentEmail: this.userInputService.getValue('primary_email')?.option_value,
      mobileNumber: this.userInputService.getValue('primary_mobile_number')?.option_value,
      phoneNumber: this.userInputService.getValue('primary_mobile_number')?.option_value,
      gender: this.userInputService.getValue('gender')?.option_value,
      dateOfBirth: this.userInputService.getValue('date_of_birth_API'),
      maritalStatus: this.userInputService.getValue('maritalStatus')?.option_value,
      passport: this.userInputService.getValue('passport')?.option_value,
      nationalityCode: this.userInputService.getValue('nationalityCode')?.option_value,
      preferredStudyDestination: this.userInputService.getValue('preferredCountryCode')?.option_value,
      interestedIn: '',
      marketingAcceptanceIndicator: this.marketingAcceptanceIndicator,
      preferredStudyLevel: this.userInputService.getValue('preferredStudyLevel')?.option_value,
      plannedStudyDate: this.userInputService.getValue('studyPlanTimeline').option_value,
      primaryFinancialSource: this.userInputService.getValue('primaryFinancialSource')?.option_value,
      howDidYouHear: this.userInputService.getValue('howDidYouHear')?.option_value,
      preferred_counselling_mode: 'In-Person',
      siteIDCountry: this.country,
      countryCode: this.countryCode,
      siteCountryCode: this.countryCode,
      leadRoutingTeamID: this.cookieService.get('wirCounsellorTeam'),
      counsellorEmail: ''
    }
    this.wirService.userRegistrationForm(payload).subscribe((data: any) => {
      this.showLoader = false
      this.gtmImplementation.trackKPI('wir_user_registration_submit', 'submit', 'submit_button', 'user_registration', 'review_details', 'signed_in_user')
      this.route?.navigateByUrl('/thankyou')
    }, (error: any) => {
      console.log(error.error.message)
      this.showLoader = false
      if (error.error.message === 'Invalid request body') {
        localStorage.setItem('detailsPage', 'true')
      }
      this.route?.navigateByUrl('/error')
    })
  }
}
