import { Component, EventEmitter, OnInit, Output } from '@angular/core'
import { Router } from '@angular/router'
import { ValidatorService } from '../../../common/utilities/validator.service'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { languageContent } from '../../../common/json/sign-up-content'
import { UserInputService } from 'src/app/common/api/services/user-input.service'
import { CookieService } from 'ngx-cookie-service'
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core'
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter'
import * as moment from 'moment'
import { DatePipe, ViewportScroller } from '@angular/common'
import { ProgressiveProfileQuestionsService } from 'src/app/common/api/services/progressive-profile-qsts.service'
import { WIRService } from 'src/app/common/api/services/wir.service'
import { fetchUserAttributes } from '@aws-amplify/auth'
import { gtmImplementation } from 'src/app/common/api/services/gtmImplementation'
import { ReplaySubject } from 'rxjs'
import { environment } from 'src/environments/environment'

export const MY_DATE_FORMAT2 = {
  parse: {
    dateInput: 'DD/MM/YYYY'
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  }
}

@Component({
  selector: 'app-personal-details',
  templateUrl: './personal-details.component.html',
  styleUrls: ['./personal-details.component.css'],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMAT2 },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS] }
  ]
})
export class PersonalDetailsComponent implements OnInit{
  showLoader: any
  selectedLanguage: any
  questions: any
  personalDetailsForm: any
  minimumLength: any
  maximumLength: any
  selectedDialCode: any
  mobileNumberCount: any
  phoneNumberInvalidError: any
  submitted: any
  country: any
  invalidDate: boolean = false
  futureDate: boolean = false
  personalDetailsNotValid: boolean = false
  phoneNumberFromCP: any
  primary_email: any
  cpCallDone: any
  userInputServiceGender: any
  allData: { [key: string]: any } = {}
  searchFilterCtrl: FormControl = new FormControl()
  filteredOptions: ReplaySubject<any[]> = new ReplaySubject<any[]>(1)
  allNationalityOptions: any[] = []
  yesterdayDate = moment().subtract(1, 'day')
  disableFutureDates = (date: moment.Moment | null): boolean => {
    if (!date) return false
    return date.isSameOrBefore(this.yesterdayDate, 'day')
  }

  @Output() nextClicked = new EventEmitter<void>()
  constructor (
    public route: Router,
    public formBuilder: FormBuilder,
    public validatorService: ValidatorService,
    public userInputService: UserInputService,
    public cookieService: CookieService,
    public viewPortScroller: ViewportScroller,
    private WIRService: WIRService,
    public datePipe: DatePipe,
    public ProgressiveProfileQuestionsService: ProgressiveProfileQuestionsService,
    public gtmImplementation: gtmImplementation
  ) {
    this.personalDetailsForm = this.formBuilder.group({
    })
  }

  showLearnMorePopup: boolean = false

  ngOnInit (): void {
    this.showLoader = true
    this.viewPortScroller.scrollToPosition([0, 0])
    this.gtmImplementation.pageView('personal_details', 'signed_in_user', 'user_registration')
    this.selectedLanguage = localStorage.getItem('languageSelected') ? localStorage.getItem('languageSelected') : 'EN'
    this.filteredOptions.next(this.questions ?? [])
    this.searchFilterCtrl.valueChanges.subscribe(() => {
      this.filterOptions()
    })

    this.getEmail()
  }

  async getEmail (): Promise<void> {
    this.primary_email = this.userInputService.getValue('primary_email')?.option_value
    if (this.primary_email === undefined) {
      if (environment.demoMode) {
        // Demo mode: use a placeholder email
        this.primary_email = 'demo@example.com'
        this.userInputService.setValue('primary_email', this.primary_email)
        this.cpCall()
        return
      }
      try {
        const userAttributes = await fetchUserAttributes()
        this.primary_email = userAttributes.email
        this.userInputService.setValue('primary_email', this.primary_email)
        this.cpCall()
      } catch (error) {
        console.error('Error fetching user email:', error)
        this.route?.navigateByUrl('/error')
      }
    } else {
      this.cpCall()
    }
  }

  filterOptions (): any {
    let search = this.searchFilterCtrl.value

    if (!search) {
      this.filteredOptions.next(this.allNationalityOptions.slice())
      return
    }

    search = search.toLowerCase()
    this.filteredOptions.next(
      this.allNationalityOptions.filter((opt: any) =>
        opt.option_label.toLowerCase().includes(search)
      )
    )
  }

  cpCall (): any{
    this.cpCallDone = this.userInputService.getValue('cp_call_done')
    if (this.cpCallDone !== 'true') {
      this.cpStudentCall()
    } else {
      this.getProgressiveProfileQstns()
    }
  }

  cpStudentCall (): any{
    this.userInputService.setValue('cp_call_done', 'true')
    this.WIRService.isUserAlreadyExist(this.primary_email, this.selectedLanguage).subscribe({
      next: (user: any) => {
        if (user.student_already_exists === true) {
          this.prePopulateFromCP(user)
        }
        this.getProgressiveProfileQstns()
      },
      error: (err: any) => {
        console.log('Error in isUserAlreadyExist:', err)
        this.showLoader = false
        this.route?.navigateByUrl('/error')
      }
    })
  }

  getProgressiveProfileQstns (): any {
    this.questions = this.ProgressiveProfileQuestionsService.serviceQuestions?.items[0]?.fields?.questions
    if (this.questions === undefined) {
      this.showLoader = true
      this.ProgressiveProfileQuestionsService.getPPqstns().subscribe(
        (res: any) => {
          this.questions = res.items[0].fields.questions
          this.generateFormControl(this.questions)
          this.autopopulateDataToService()
        },
        (error: any) => {
          console.log(error)
          this.showLoader = false
          this.route?.navigateByUrl('/error')
        }
      )
    } else {
      this.generateFormControl(this.questions)
      this.autopopulateDataToService()
    }
  }

  prePopulateFromCP (user: any): any {
    this.userInputService.setValue('first_name', user.cp_response.studentBaseInfo.firstName)
    this.userInputService.setValue('last_name', user.cp_response.studentBaseInfo.lastName)
    const numberWithDialCode = user.cp_response.studentBaseInfo.primaryMobileNumber
    if (numberWithDialCode !== null) {
      const numberWithoutDialCode = numberWithDialCode.split(' ')
      this.phoneNumberFromCP = numberWithoutDialCode[numberWithoutDialCode.length - 1]
      this.userInputService.setValue('primary_mobile_number', this.phoneNumberFromCP)
    }
    this.userInputService.setValue('primary_email', user.cp_response.studentBaseInfo.primaryEmail)
    const dateOfBirth = user.cp_response.studentBaseInfo.dateOfBirth
    if (dateOfBirth !== null) {
      const dateOfBirthFormatted = moment(dateOfBirth, 'YYYY-MM-DD').format('DD/MM/YYYY')
      this.userInputService.setValue('date_of_birth', dateOfBirthFormatted)
      const dobAPI = moment(dateOfBirthFormatted, 'DD/MM/YYYY').format('YYYY-MM-DD') + 'T00:00:00'

      this.onInputChange('date_of_birth_API', dobAPI)
    }
    this.userInputService.setValue('maritalStatus', { option_label: user.cp_response.studentAdditionalInfo.maritalStatus })
    this.userInputService.setValue('nationalityCode', { option_label: user.cp_response.studentAdditionalInfo.nationalityCode })
    const gender = user.cp_response.studentBaseInfo.gender

    if (gender === 'Nonbinary') {
      this.userInputServiceGender = 'Non-Binary'
    } else if (gender === 'Gender not known') {
      // do nothing
    } else if (gender === 'Gender not specified'){
      this.userInputServiceGender = 'Prefer not to say'
    } else {
      this.userInputServiceGender = user.cp_response.studentBaseInfo.gender
    }
    this.userInputService.setValue('gender', { option_label: this.userInputServiceGender })
    this.userInputService.setValue('primaryFinancialSource', { option_label: user.cp_response.studentAdditionalInfo.primaryFinancialSource })
    this.userInputService.setValue('howDidYouHear', { option_label: user.cp_response.studentAdditionalInfo.howDidYouHear })
  }

  autopopulateDataToService (): any {
    const storedData = this.userInputService.getAllValues()
    for (const key in storedData) {
      const value = storedData[key]
      if (!(key === 'first_name' || key === 'last_name' ||
        key === 'primary_mobile_number' || key === 'primary_email' ||
        key === 'dialCode' || key === 'marketing_acceptance_flag' ||
      key === 'date_of_birth')) {
        const matchingOption = this.questions
          ?.find((q: { mappingField: string }) => q.mappingField === key)
          ?.options
          ?.find((opt: { option_label: any }) => opt.option_label === value?.option_label)

        this.onInputChange(key, matchingOption ?? value)
      }
    }
  }

  generateFormControl (ppQuestions: any): any {
    const formControl: any = {}
    if (ppQuestions) {
      ppQuestions.forEach((element: any) => {
        if (element.displayFormat.value === 'SELECT_BOX') {
          if (element.mappingField === 'dialCode') {
            formControl[element.mappingField] = new FormControl(element.defaultValue, [Validators.required])
            this.minimumLength = element.minLength
            this.maximumLength = element.maxLength
            if (element.minLength === element.maxLength) {
              this.mobileNumberCount = element.minLength
            } else {
              this.mobileNumberCount = element.minLength + ' - ' + element.maxLength
            }
          } else if (element.mappingField === 'gender' || element.mappingField === 'maritalStatus') {
            formControl[element.mappingField] = new FormControl('')
          } else if (element.mappingField === 'nationalityCode' ||
            element.mappingField === 'passport' || element.mappingField === 'preferredCountryCode' ||
            element.mappingField === 'preferredStudyLevel' || element.mappingField === 'studyPlanTimeline' ||
            element.mappingField === 'dialCode') {
            formControl[element.mappingField] = new FormControl('', Validators.required)
          }
        } else if (element.displayFormat.value === 'TEXT_BOX' && (element.mappingField === 'first_name' || element.mappingField === 'last_name' || element.mappingField === 'primary_mobile_number')) {
          formControl[element.mappingField] = new FormControl('', Validators.required)
        } else if (element.displayFormat.value === 'DATE_PICKER') {
          formControl[element.mappingField] = new FormControl('')
        }
        if (element.mappingField === 'nationalityCode') {
          this.allNationalityOptions = element.options ?? []
          this.filteredOptions.next(this.allNationalityOptions.slice())
        }
      })
    }
    this.personalDetailsForm = new FormGroup(formControl)
    const storedData = this.userInputService.getAllValues()
    const patchValues: { [key: string]: any } = {}
    for (const key in storedData) {
      const value = storedData[key]
      if (key === 'date_of_birth'){
        patchValues[key] = moment(value?.option_label, 'DD/MM/YYYY')
      } else if (Array.isArray(value)) {
        const question = this.questions?.find((q: any) => q.mappingField === key)

        if (!question?.options?.length) {
          setTimeout(() => {
            const patchValuesRetry: any = {}

            for (const retryKey in storedData) {
              const retryValue = storedData[retryKey]

              if (retryKey === 'date_of_birth') {
                patchValuesRetry[retryKey] = moment(retryValue?.option_label, 'DD/MM/YYYY')
              } else if (Array.isArray(retryValue)) {
                const retryQuestion = this.questions?.find((q: any) => q.mappingField === retryKey)
                if (retryQuestion?.options?.length) {
                  const matched = retryValue
                    .map((v: any) =>
                      retryQuestion.options.find((opt: any) => opt.option_value === v.option_value)
                    )
                    .filter(Boolean)
                  patchValuesRetry[retryKey] = matched
                }
              } else {
                patchValuesRetry[retryKey] = retryValue?.option_label
              }
            }

            this.personalDetailsForm.patchValue(patchValuesRetry)
          }, 100)

          return
        }

        const matchedOptions = value
          .map((v: any) =>
            question.options.find((opt: any) => opt.option_value === v.option_value)
          )
          .filter(Boolean)
        patchValues[key] = matchedOptions
      } else {
        patchValues[key] = value?.option_label
      }
    }

    this.personalDetailsForm.patchValue(patchValues)
    this.showLoader = false
  }

  onInputChange (field: string, value: string, event?: any): any {
    if (event?.selected === false) {
      this.userInputService.deleteValue(field)
    } else {
      this.userInputService.setValue(field, value)
    }
  }

  onInputString (field: string, event: FocusEvent): void {
    const inputElement = event.target as HTMLInputElement
    const trimmedValue = inputElement.value.trim()

    inputElement.value = trimmedValue
    this.userInputService.setValue(field, trimmedValue)
    this.personalDetailsForm.get(field)?.setValue(trimmedValue)
  }

  onDateChange (event: any): void {
    const d = moment(event.value).format('DD/MM/YYYY')
    if (!(d.match(/^\d{2}\/\d{2}\/\d{4}$/) && d.includes('/'))) {
      this.userInputService.deleteValue('date_of_birth')
      this.userInputService.deleteValue('date_of_birth_API')
      this.invalidDate = true
    } else {
      const selectedDate = moment(event.value, 'DD/MM/YYYY')
      const yesterdayDate = moment().startOf('day').subtract(1, 'day')

      if (selectedDate.isAfter(yesterdayDate)) {
        this.userInputService.deleteValue('date_of_birth')
        this.userInputService.deleteValue('date_of_birth_API')
        this.futureDate = true
      } else {
        this.invalidDate = false
        this.futureDate = false
        const dateDisplay = selectedDate.format('DD/MM/YYYY')
        const dobAPI = selectedDate.format('YYYY-MM-DD') + 'T00:00:00'

        this.onInputChange('date_of_birth', dateDisplay)
        this.onInputChange('date_of_birth_API', dobAPI)
      }
    }
  }

  phoneNumberValidation (phoneNumber: any): any {
    this.selectedDialCode = phoneNumber
    this.minimumLength = phoneNumber.minLength
    this.maximumLength = phoneNumber.maxLength
    this.phoneNumber('primary_mobile_number')
    if (phoneNumber.minLength === phoneNumber.maxLength) {
      this.mobileNumberCount = phoneNumber.minLength
    } else {
      this.mobileNumberCount = phoneNumber.minLength + ' - ' + phoneNumber.maxLength
    }
    this.phoneNumberInvalidError = ''
    if (this.selectedLanguage === 'EN') {
      this.phoneNumberInvalidError = languageContent[this.selectedLanguage].phoneNumberInvalidError1 + ' ' + this.mobileNumberCount + ' ' + languageContent[this.selectedLanguage].phoneNumberInvalidError2
    } else {
      this.phoneNumberInvalidError = languageContent[this.country + '_' + this.selectedLanguage]?.phoneNumberInvalidError1 + ' ' + this.mobileNumberCount + ' ' + languageContent[this.country + '_' + this.selectedLanguage]?.phoneNumberInvalidError2
    }
  }

  phoneNumber (mappingField: any): any {
    if (mappingField === 'primary_mobile_number') {
      const mobNum = this.personalDetailsForm.controls.primary_mobile_number?.value.length
      const isDigit = this.validatorService.isDigit(this.personalDetailsForm.controls.primary_mobile_number?.value)
      if (isDigit) {
        if (mobNum < this.minimumLength || mobNum > this.maximumLength || mobNum === 0) {
          this.personalDetailsForm.controls.primary_mobile_number?.setErrors({ invalidPhoneNumber: true })
        } else {
          this.personalDetailsForm.controls.primary_mobile_number?.setErrors(null)
        }
      } else {
        this.personalDetailsForm.controls.primary_mobile_number?.setErrors({ invalidPhoneNumber: true })
      }

      if (!mobNum) {
        this.personalDetailsForm.controls.primary_mobile_number?.setErrors({ required: true })
      }
      if (this.selectedLanguage === 'EN') {
        this.phoneNumberInvalidError = languageContent[this.selectedLanguage]?.phoneNumberInvalidError1 + ' ' + this.mobileNumberCount + ' ' + languageContent[this.selectedLanguage]?.phoneNumberInvalidError2
      } else {
        this.phoneNumberInvalidError = languageContent[this.country + '_' + this.selectedLanguage]?.phoneNumberInvalidError1 + ' ' + this.mobileNumberCount + ' ' + languageContent[this.country + '_' + this.selectedLanguage]?.phoneNumberInvalidError2
      }
    }
  }

  openLearnMorePopup (): void{
    this.showLearnMorePopup = true
    document.body.classList.add('no-scroll')
  }

  closeLearnMorePopup (): void{
    this.showLearnMorePopup = false
    document.body.classList.remove('no-scroll')
  }

  preventEnter (event: Event): void {
    const keyboardEvent = event as KeyboardEvent
    keyboardEvent.preventDefault()
    keyboardEvent.stopPropagation()
  }

  nextButton (): void {
    this.submitted = true
    this.phoneNumber('primary_mobile_number')
    if (this.personalDetailsForm.valid) {
      this.gtmImplementation.trackEvents('wir_personal_details', 'next_button', 'next', 'personal_details', 'signed_in_user', 'user_registration')
      if (this.userInputService.getValue('dialCode') === undefined) {
        this.userInputService.setValue('dialCode', this.personalDetailsForm.value.dialCode)
      }

      this.nextClicked.emit()
    } else {
      setTimeout(() => {
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
      }, 50);
    }
  }
}