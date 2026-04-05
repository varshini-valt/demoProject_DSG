import { Component, ElementRef, EventEmitter, OnInit, Output } from '@angular/core'
import { Router } from '@angular/router'
import { ValidatorService } from '../../../common/utilities/validator.service'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { UserInputService } from 'src/app/common/api/services/user-input.service'
import { CookieService } from 'ngx-cookie-service'
import { ProgressiveProfileQuestionsService } from 'src/app/common/api/services/progressive-profile-qsts.service'
import { ViewportScroller } from '@angular/common'
import { gtmImplementation } from 'src/app/common/api/services/gtmImplementation'

@Component({
  selector: 'app-other-details',
  templateUrl: './other-details.component.html',
  styleUrls: ['./other-details.component.css']
})
export class OtherDetailsComponent implements OnInit {
  questions: any
  otherDetailsForm: any
  officeDetails: any
  selectedLanguage: any
  showLoader: any
  submitted: any
  @Output() nextClicked = new EventEmitter<void>()
  @Output() backClicked = new EventEmitter<void>()
  constructor (
    public route: Router,
    public fb: FormBuilder,
    public validatorService: ValidatorService,
    public userInputService: UserInputService,
    public viewPortScroller: ViewportScroller,
    public cookieService: CookieService,
    public ProgressiveProfileQuestionsService: ProgressiveProfileQuestionsService,
    private el: ElementRef,
    public gtmImplementation: gtmImplementation
  ) {
    this.otherDetailsForm = this.fb.group({
    })
  }

  ngOnInit (): void {
    this.viewPortScroller.scrollToPosition([0, 0])
    this.gtmImplementation.pageView('other_details', 'signed_in_user', 'user_registration')
    this.selectedLanguage = localStorage.getItem('languageSelected') ? localStorage.getItem('languageSelected') : 'EN'
    this.getProgressiveProfileQstns()
  }

  onInputChange (field: string, value: string, event?: any): any {
    if (event?.selected === false) {
      this.userInputService.deleteValue(field)
    } else {
      this.userInputService.setValue(field, value)
    }
  }

  getProgressiveProfileQstns (): any {
    this.questions = this.ProgressiveProfileQuestionsService.serviceQuestions?.items[0]?.fields?.questions
    if (this.questions === undefined) {
      this.showLoader = true
      this.ProgressiveProfileQuestionsService.getPPqstns().subscribe(
        (res: any) => {
          this.questions = res.items[0].fields.questions
          this.generateFormControl(this.questions)
          this.showLoader = false
        },
        (error: any) => {
          console.log(error)
          this.showLoader = false
          this.route?.navigateByUrl('/error')
        }
      )
    } else {
      this.generateFormControl(this.questions)
    }
  }

  generateFormControl (ppQuestions: any): any {
    const formControl: any = {}
    if (ppQuestions) {
      ppQuestions.forEach((element: any) => {
        if (element.displayFormat.value === 'SELECT_BOX' && (element.mappingField === 'primaryFinancialSource' || element.mappingField === 'howDidYouHear')) {
          formControl[element.mappingField] = new FormControl('', Validators.required)
        }
      })
    }
    this.otherDetailsForm = new FormGroup(formControl)

    const storedData = this.userInputService.getAllValues()
    const patchValues: { [key: string]: any } = {}
    for (const key in storedData) {
      const value = storedData[key]
      patchValues[key] = value?.option_label
    }
    this.otherDetailsForm.patchValue(patchValues)
    this.showLoader = false
  }

  nextButton (): void {
    this.submitted = true
    if (this.otherDetailsForm.valid) {
      this.gtmImplementation.trackEvents('wir_other_details', 'next_button', 'next', 'other_details', 'signed_in_user', 'user_registration')
      this.nextClicked.emit()
    } else {
      const invalidControl = document.querySelector(
        'form .ng-invalid'
      ) as HTMLElement

      if (invalidControl) {
        invalidControl.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setTimeout(() => {
          const elementToFocus =
            invalidControl.querySelector('input, [type="checkbox"], mat-select') ||
            invalidControl
          elementToFocus.classList.add('scroll-field-error');
          (elementToFocus as HTMLElement).focus()
        }, 300)
      }
    }
  }

  backButton (): void {
    this.backClicked.emit()
    this.gtmImplementation.trackEvents('wir_other_details', 'back_button', 'back', 'other_details', 'signed_in_user', 'user_registration')
  }
}
