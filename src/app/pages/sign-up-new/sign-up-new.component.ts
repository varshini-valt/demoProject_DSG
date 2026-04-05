import { Component, OnInit, ViewChild } from '@angular/core'
import { languageContent } from '../../common/json/sign-up-content'
import { CookieService } from 'ngx-cookie-service'
import { UserInputService } from 'src/app/common/api/services/user-input.service'
import { OtherDetailsComponent } from '../Registration-Pages/other-details/other-details.component'
import { PersonalDetailsComponent } from '../Registration-Pages/personal-details/personal-details.component'
import { Router } from '@angular/router'
import { ViewportScroller } from '@angular/common'
import { gtmImplementation } from 'src/app/common/api/services/gtmImplementation'

@Component({
  selector: 'app-sign-up-new',
  templateUrl: './sign-up-new.component.html',
  styleUrls: ['./sign-up-new.component.css']
})
export class SignUpNewComponent implements OnInit {
  currentNumber: number = 1
  showLoader: any
  selectedLanguage: any
  formHeading: any
  numberOfQuestions: any
  isExistingUser: any
  countryCode: any
  maliciousUser: any
  clickedNumber: number = 0
  messageBoxopen: boolean = true
  @ViewChild(OtherDetailsComponent, { static: false }) otherDetailsComponent!: OtherDetailsComponent
  @ViewChild(PersonalDetailsComponent) PersonalDetailsComponent!: PersonalDetailsComponent

  constructor (
    public cookieService: CookieService,
    public userInputService: UserInputService,
    public route: Router,
    public viewPortScroller: ViewportScroller,
    public gtmImplementation: gtmImplementation) {}

  ngOnInit (): void{
    this.viewPortScroller.scrollToPosition([0, 0])
    this.maliciousUser = localStorage.getItem('maliciousUser') ? localStorage.getItem('maliciousUser') : 'false'
    this.countryCode = this.cookieService.get('countrycode')
    localStorage.setItem('detailsPage', 'false')
    this.isExistingUser = localStorage.getItem('isExistingUser') ? localStorage.getItem('isExistingUser') : 'false'
    this.selectedLanguage = localStorage.getItem('languageSelected') ? localStorage.getItem('languageSelected') : 'EN'
    if (this.selectedLanguage === 'EN') {
      this.formHeading = languageContent[this.selectedLanguage]?.registrationFormHeading
      this.numberOfQuestions = languageContent[this.selectedLanguage]?.numberOfQuestionsText
    } else {
      this.formHeading = languageContent[this.countryCode + '_' + this.selectedLanguage]?.registrationFormHeading
      this.numberOfQuestions = languageContent[this.countryCode + '_' + this.selectedLanguage]?.numberOfQuestionsText
    }
  }

  selectedComponent (number: number): void {
    this.currentNumber = number
  }

  clickedReview (number: number): void {
    this.clickedNumber = number
    if (this.clickedNumber === 3) {
      if (this.currentNumber === 1) {
        this.triggerNextFromPersonalDetails()
      } else if (this.currentNumber === 2) {
        this.triggerNextFromOtherDetails()
      }
    }

    if (this.clickedNumber === 2) {
      if (this.currentNumber === 3) {
        this.gtmImplementation.trackEvents('wir_review_details', 'back_button', 'back', 'review_details', 'signed_in_user', 'user_registration')
        this.selectedComponent(2)
      } else if (this.currentNumber === 1) {
        this.triggerNextFromPersonalDetails()
      }
    }

    if (this.clickedNumber === 1 || this.clickedNumber === 0) {
      if(this.currentNumber === 2){
        this.gtmImplementation.trackEvents('wir_other_details', 'back_button', 'back', 'other_details', 'signed_in_user', 'user_registration')
      }
       if(this.currentNumber === 3){
        this.gtmImplementation.trackEvents('wir_review_details', 'back_button', 'back', 'review_details', 'signed_in_user', 'user_registration')
      }
      this.selectedComponent(1)
    }
  }

  onPersonalDetailsNext (): void {
    if (this.clickedNumber === 3) {
      this.currentNumber = 2
      this.showLoader = true
      setTimeout(() => {
        if (this.otherDetailsComponent) {
          this.otherDetailsComponent.nextButton()
          this.showLoader = false
        } else {
          console.warn('otherDetailsComponent is still undefined')
        }
      }, 500)
    } else {
      this.currentNumber = 2
    }
  }

  onOtherDetailsNext (): any {
    this.currentNumber = 3
  }

  onOtherDetailsBack (): any {
    this.currentNumber = 1
  }

  onReviewDetailsBack (): any {
    this.currentNumber = 2
  }

  triggerNextFromOtherDetails (): void {
    this.otherDetailsComponent.nextButton()
  }

  triggerNextFromPersonalDetails (): void {
    this.PersonalDetailsComponent.nextButton()
  }

  messageBox (): any{
    this.messageBoxopen = false
  }
}
