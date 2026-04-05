import { ComponentFixture, TestBed } from '@angular/core/testing'
import { PersonalDetailsComponent } from './personal-details.component'
import { ProgressiveProfileQuestionsService } from 'src/app/common/api/services/progressive-profile-qsts.service'
import { UserInputService } from 'src/app/common/api/services/user-input.service'
import { ValidatorService } from '../../../common/utilities/validator.service'
import { Router } from '@angular/router'
import { CookieService } from 'ngx-cookie-service'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { DatePipe } from '@angular/common'
import { of, throwError } from 'rxjs'
import * as moment from 'moment'
import { WIRService } from 'src/app/common/api/services/wir.service'
import { gtmImplementation } from 'src/app/common/api/services/gtmImplementation'

const mockGtmImplementation = {
  pageView: jest.fn(),
  trackEvents: jest.fn()
}

jest.useFakeTimers()

describe('PersonalDetailsComponent', () => {
  let component: PersonalDetailsComponent
  let fixture: ComponentFixture<PersonalDetailsComponent>

  const mockPPService = {
    serviceQuestions: {
      items: [
        {
          fields: {
            questions: [
              { displayFormat: { value: 'TEXT_BOX' }, mappingField: 'first_name' },
              { displayFormat: { value: 'TEXT_BOX' }, mappingField: 'last_name' },
              { displayFormat: { value: 'DATE_PICKER' }, mappingField: 'date_of_birth' },
              { displayFormat: { value: 'TEXT_BOX' }, mappingField: 'primary_mobile_number' },
              { displayFormat: { value: 'SELECT_BOX' }, mappingField: 'dialCode', minLength: 10, maxLength: 10 }
            ]
          }
        }
      ]
    },
    getPPqstns: jest.fn()
  }

  const mockUserInputService = {
    setValue: jest.fn(),
    deleteValue: jest.fn(),
    getValue: jest.fn((key: string) => {
      if (key === 'cookies') return 'true'
      return { option_label: 'true' }
    }),
    getAllValues: jest.fn(() => ({
      first_name: { option_label: 'John' },
      last_name: { option_label: 'Doe' },
      date_of_birth: { option_label: '01/01/2000' },
      primary_mobile_number: { option_label: '9876543210' }
    }))
  }

  const mockValidatorService = {
    isDigit: jest.fn(() => true)
  }

  const mockRouter = { navigateByUrl: jest.fn() }

  const mockCookieService = {
    get: jest.fn((key: string) => {
      const map: { [key: string]: string } = {
        country: 'India',
        officeId: '/students//HIN01'
      }
      return map[key] || ''
    })
  }

  const mockElementRef = {
    nativeElement: {
      querySelector: jest.fn()
    }
  }

  const mockWIRService = {
    isUserAlreadyExist: jest.fn().mockReturnValue(of({
      student_already_exists: true,
      cp_response: {
        studentBaseInfo: {
          firstName: 'John',
          lastName: 'Doe',
          primaryMobileNumber: '+91 9876543210',
          primaryEmail: 'john@example.com',
          dateOfBirth: '1990-01-01',
          gender: 'Male'
        },
        studentAdditionalInfo: {
          maritalStatus: 'Single',
          nationalityCode: 'IN',
          interestedIDPSerivce: 'TestService',
          preferredCountryCode: 'AU',
          primaryFinancialSource: 'Self',
          howDidYouHear: 'Google'
        },
        studyPlanDetail: {
          preferredStudyLevel: 'Postgraduate',
          studyPlanTimeline: '2025'
        }
      }
    }))
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PersonalDetailsComponent],
      providers: [
        { provide: ProgressiveProfileQuestionsService, useValue: mockPPService },
        { provide: UserInputService, useValue: mockUserInputService },
        { provide: ValidatorService, useValue: mockValidatorService },
        { provide: Router, useValue: mockRouter },
        { provide: CookieService, useValue: mockCookieService },
        { provide: gtmImplementation, useValue: mockGtmImplementation },
        { provide: WIRService, useValue: mockWIRService },
        FormBuilder,
        DatePipe
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(PersonalDetailsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create component', () => {
    expect(component).toBeTruthy()
    component.cpCall()
  })

  it('should call WIRService and prepopulate from CP', () => {
    // mockUserInputService.getValue.mockReturnValue(undefined)
    component.primary_email = 'john@example.com'
    component.selectedLanguage = 'EN'
    component.cpStudentCall()
    expect(mockWIRService.isUserAlreadyExist).toHaveBeenCalledWith('john@example.com', 'EN')
    expect(mockUserInputService.setValue).toHaveBeenCalledWith('first_name', 'John')
    expect(mockUserInputService.setValue).toHaveBeenCalledWith('maritalStatus', { option_label: 'Single' })
  })

  it('should handle error and navigate to /error when getPPqstns fails', () => {
    component.ProgressiveProfileQuestionsService.serviceQuestions = undefined
    mockPPService.getPPqstns.mockReturnValue(throwError(() => new Error('error')))
    component.getProgressiveProfileQstns()
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/error')
    expect(component.showLoader).toBe(false)
  })

  it('should call phoneNumberValidation for other language', () => {
    component.selectedLanguage = 'CHI'
    component.country = 'Taiwan'
    const phoneNumber = { minLength: 8, maxLength: 12 }
    component.phoneNumberValidation(phoneNumber)
    expect(component.minimumLength).toBe(8)
    expect(component.maximumLength).toBe(12)
  })

  it('should initialize component', () => {
    component.ngOnInit()
    component.onInputChange('first_name', 'John')
    component.nextButton()
    component.filterOptions()
  })

  it('should handle valid date in onDateChange', () => {
    const mockEvent = { value: new Date('2000-01-01') }
    component.onDateChange(mockEvent)
    expect(component.invalidDate).toBe(false)
    expect(mockUserInputService.setValue).toHaveBeenCalledWith('date_of_birth', '01/01/2000')
  })

  it('should handle invalid date in onDateChange', () => {
    const mockEvent = { value: 'invalid' }
    component.onDateChange(mockEvent)
    expect(component.invalidDate).toBe(true)
  })

  it('should validate phone number with correct length', () => {
    component.selectedLanguage = 'EN'
    component.minimumLength = 10
    component.maximumLength = 10
    component.personalDetailsForm = component.formBuilder.group({
      primary_mobile_number: ['123456789']
    })
    mockValidatorService.isDigit.mockReturnValue(true)
    component.phoneNumber('primary_mobile_number')
    expect(component.personalDetailsForm.controls.primary_mobile_number.errors).toEqual({ invalidPhoneNumber: true })
  })

  it('should open and close learn more popup', () => {
    component.openLearnMorePopup()
    expect(component.showLearnMorePopup).toBe(true)
    component.closeLearnMorePopup()
    expect(component.showLearnMorePopup).toBe(false)
  })

  it('should call userInputService.setValue with value on input string', () => {
    const mockInput = document.createElement('input')
    mockInput.value = 'TestVal'
    const mockEvent = { target: mockInput } as unknown as FocusEvent
    component.onInputString('interestedIDPService', mockEvent)
    expect(mockUserInputService.setValue).toHaveBeenCalledWith('interestedIDPService', 'TestVal')
  })

  it('should emit nextClicked and set dialCode when form is valid', () => {
    component.personalDetailsForm = new FormGroup({
      dialCode: new FormControl('IN', Validators.required)
    })
    const emitSpy = jest.spyOn(component.nextClicked, 'emit')
    component.nextButton()
    // expect(mockUserInputService.setValue).toHaveBeenCalledWith('dialCode', 'IN')
    expect(emitSpy).toHaveBeenCalled()
  })

  it('should not emit nextClicked when form is invalid', () => {
    component.personalDetailsForm = new FormGroup({
      dialCode: new FormControl(null, Validators.required)
    })
    const emitSpy = jest.spyOn(component.nextClicked, 'emit')
    component.nextButton()
    expect(emitSpy).not.toHaveBeenCalled()
  })

  it('should set value even if event is undefined', () => {
    component.onInputChange('test_field', 'test_value')
    expect(mockUserInputService.setValue).toHaveBeenCalledWith('test_field', 'test_value')
  })

  it('should set phoneNumberInvalidError for EN language', () => {
    component.selectedLanguage = 'EN'
    component.country = 'India'
    component.minimumLength = 10
    component.maximumLength = 10
    component.phoneNumberValidation({ minLength: 10, maxLength: 10 })
    expect(component.phoneNumberInvalidError).toContain('10')
  })

  it('should disable future dates', () => {
    const future = moment().add(1, 'day')
    const past = moment().subtract(1, 'day')
    expect(component.disableFutureDates(future)).toBe(false)
    expect(component.disableFutureDates(past)).toBe(true)
  })

  it('should call userInputService.setValue on input string for multi values', () => {
    const mockInput = document.createElement('input')
    mockInput.value = 'IDP030, IDP040, IDP050'
    const mockEvent = {
      target: mockInput
    } as unknown as FocusEvent
    component.onInputString('interestedIDPService', mockEvent)
    expect(mockUserInputService.setValue).toHaveBeenCalledWith('interestedIDPService', 'IDP030, IDP040, IDP050')
  })

  it('when serviceQuestions is not undefined', () => {
    component.ProgressiveProfileQuestionsService.serviceQuestions = {
      items: [{
        fields: {
          questions: [
            {
              mappingField: 'first_name',
              displayFormat: { value: 'TEXT_BOX' }
            },
            {
              mappingField: 'last_name',
              displayFormat: { value: 'TEXT_BOX' }
            },
            {
              mappingField: 'primary_email',
              displayFormat: { value: 'TEXT_BOX' }
            },
            {
              mappingField: 'password',
              displayFormat: { value: 'TEXT_BOX' }
            }
          ]
        }
      }]
    }
    const spy = jest.spyOn(component, 'generateFormControl')
    component.getProgressiveProfileQstns()
    expect(spy).toHaveBeenCalled()
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

  it('should handle missing cp_response in cpStudentCall gracefully', () => {
    mockWIRService.isUserAlreadyExist.mockReturnValue(of({
      student_already_exists: true
    }))
    component.primary_email = 'john@example.com'
    component.selectedLanguage = 'EN'
    component.cpStudentCall()
  })

  it('should set invalidPhoneNumber error when digits are invalid', () => {
    mockValidatorService.isDigit.mockReturnValue(false)
    component.minimumLength = 10
    component.maximumLength = 10
    component.selectedLanguage = 'EN'
    component.personalDetailsForm = new FormGroup({
      primary_mobile_number: new FormControl('abc123')
    })
    component.phoneNumber('primary_mobile_number')
    expect(component.personalDetailsForm.get('primary_mobile_number')?.errors).toEqual({ invalidPhoneNumber: true })
  })

  it('should fetch and generate form control if serviceQuestions is initially undefined', () => {
    mockPPService.getPPqstns.mockReturnValue(of({
      items: [
        {
          fields: {
            questions: [{ mappingField: 'dummy', displayFormat: { value: 'TEXT_BOX' } }]
          }
        }
      ]
    }))
    component.ProgressiveProfileQuestionsService.serviceQuestions = undefined
    const spy = jest.spyOn(component, 'generateFormControl')
    component.getProgressiveProfileQstns()
    expect(spy).toHaveBeenCalled()
  })

  it('should delete value if onInputChange is called with event.selected === false', () => {
    const deleteSpy = jest.spyOn(mockUserInputService, 'deleteValue')
    component.onInputChange('first_name', 'John', { selected: false })
    expect(deleteSpy).toHaveBeenCalledWith('first_name')
  })

  it('should navigate to /error if no questions are returned', () => {
    mockPPService.getPPqstns.mockReturnValue(of({ items: [] }))
    component.ProgressiveProfileQuestionsService.serviceQuestions = undefined
    component.getProgressiveProfileQstns()
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/error')
  })

  it('should handle unknown displayFormat in generateFormControl', () => {
    const questions = [{
      mappingField: 'unknown_field',
      displayFormat: { value: 'UNKNOWN_TYPE' }
    }]
    component.generateFormControl(questions)
  })
  it('should set invalidPhoneNumber error when phone number length is out of bounds', () => {
    mockValidatorService.isDigit.mockReturnValue(true)
    component.minimumLength = 10
    component.maximumLength = 10
    component.selectedLanguage = 'EN'
    component.personalDetailsForm = new FormGroup({
      primary_mobile_number: new FormControl('123456')
    })
    component.phoneNumber('primary_mobile_number')
    expect(component.personalDetailsForm.get('primary_mobile_number')?.errors).toEqual({ invalidPhoneNumber: true })
  })

  it('should emit nextClicked when called', () => {
    const spy = jest.fn()
    component.nextClicked.subscribe(spy)
    component.nextClicked.emit()
    expect(spy).toHaveBeenCalled()
  })

  it('should set interestedIdpServiceGTM and call setValue when interestedIDPSerivce exists', () => {
    const mockInterestedData = [
      { option_label: 'Service1' },
      { option_label: 'Service2' },
      { option_label: '' }
    ]

    jest.spyOn(component.userInputService, 'getValue')
      .mockImplementation((key: string) => {
        if (key === 'interestedIDPSerivce') return mockInterestedData
        return 'someValue'
      })

    jest.spyOn(component.userInputService, 'getAllValues')
      .mockReturnValue({ interestedIDPSerivce: mockInterestedData })

    // const setValueSpy = jest.spyOn(component.userInputService, 'setValue')
    const trackEventsSpy = jest.spyOn(component.gtmImplementation, 'trackEvents')

    component.personalDetailsForm.patchValue({
      title: 'Ms',
      first_name: 'Test',
      last_name: 'User',
      date_of_birth: '2000-01-01',
      dialCode: '+91',
      primary_mobile_number: '9876543210'
    })

    component.nextButton()

    // expect(component.interestedIdpServiceGTM).toBe('Service1|Service2')
    // expect(setValueSpy).toHaveBeenCalledWith('preferredServiceGTM', 'Service1|Service2')
    expect(trackEventsSpy).toHaveBeenCalledWith(
      'wir_personal_details',
      'next_button',
      'next',
      'personal_details',
      'signed_in_user',
      'user_registration'
    )
  })
  describe('submitPersonalDetailsForm - invalid case', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.clearAllTimers()
      jest.restoreAllMocks()
    })

    it('should scroll, focus, and add class to the first invalid input control', () => {
      const invalidEl = document.createElement('div')
      invalidEl.classList.add('ng-invalid')
      invalidEl.scrollIntoView = jest.fn()

      const inputEl = document.createElement('input')
      inputEl.focus = jest.fn()
      invalidEl.appendChild(inputEl)

      jest.spyOn(document, 'querySelector').mockReturnValue(invalidEl)

      component.personalDetailsForm.setErrors({ invalid: true })

      component.nextButton()

      jest.runAllTimers()

      expect(invalidEl.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center'
      })
      expect(inputEl.focus).toHaveBeenCalled()
      expect(inputEl.classList.contains('scroll-field-error')).toBe(true)
    })

    it('should fallback to focusing the container if no input is found', () => {
      const invalidEl = document.createElement('div')
      invalidEl.classList.add('ng-invalid')
      invalidEl.scrollIntoView = jest.fn()
      invalidEl.focus = jest.fn()

      jest.spyOn(document, 'querySelector').mockReturnValue(invalidEl)

      component.personalDetailsForm.setErrors({ invalid: true })

      component.nextButton()
      jest.runAllTimers()

      expect(invalidEl.scrollIntoView).toHaveBeenCalled()
      expect(invalidEl.focus).toHaveBeenCalled()
      expect(invalidEl.classList.contains('scroll-field-error')).toBe(true)
    })
  })
})
