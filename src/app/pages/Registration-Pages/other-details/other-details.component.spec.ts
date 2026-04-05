import { ComponentFixture, TestBed } from '@angular/core/testing'
import { OtherDetailsComponent } from './other-details.component'
import { UserInputService } from 'src/app/common/api/services/user-input.service'
import { ValidatorService } from '../../../common/utilities/validator.service'
import { Router } from '@angular/router'
import { CookieService } from 'ngx-cookie-service'
import { FormBuilder, FormControl } from '@angular/forms'
import { of, throwError } from 'rxjs'
import { CUSTOM_ELEMENTS_SCHEMA, ElementRef } from '@angular/core'
import { ProgressiveProfileQuestionsService } from 'src/app/common/api/services/progressive-profile-qsts.service'
import { gtmImplementation } from 'src/app/common/api/services/gtmImplementation'

const mockGtmImplementation = {
  pageView: jest.fn(),
  trackEvents: jest.fn(),
  trackKPI: jest.fn()
}

describe('OtherDetailsComponent', () => {
  let component: OtherDetailsComponent
  let fixture: ComponentFixture<OtherDetailsComponent>

  const mockPPService = {
    serviceQuestions: {
      items: [
        {
          fields: {
            questions: [
              {
                displayFormat: { value: 'SELECT_BOX' },
                mappingField: 'primaryFinancialSource',
                options: [{ option_label: 'Savings' }]
              }
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
    getAllValues: jest.fn(() => ({
      primaryFinancialSource: { option_label: 'Savings' },
      howDidYouHear: { option_label: 'Internet' }
    })),
    getValue: jest.fn((key: string) => {
      const values: any = {
        cookies: 'true',
        interestedIDPSerivce: { option_value: 'Yes' },
        preferredCountryCode: { option_value: 'United States' },
        preferredStudyLevel: { option_value: 'Bachelor' },
        studyPlanTimeline: { option_value: 'Now' },
        primary_email: { option_value: 'test@example.com' }
      }
      return values[key]
    })
  }

  const mockCookieService = {
    get: jest.fn((key: string) => {
      const map: { [key: string]: string } = {
        country: 'India',
        officeId: 'https://test.com/HIN01'
      }
      return map[key] || ''
    })
  }

  const mockValidatorService = {}
  const mockRouter = { navigateByUrl: jest.fn() }

  const mockElementRef = {
    nativeElement: {
      querySelector: jest.fn().mockReturnValue({
        scrollIntoView: jest.fn(),
        focus: jest.fn()
      })
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OtherDetailsComponent],
      providers: [
        { provide: ProgressiveProfileQuestionsService, useValue: mockPPService },
        { provide: UserInputService, useValue: mockUserInputService },
        { provide: ValidatorService, useValue: mockValidatorService },
        { provide: Router, useValue: mockRouter },
        { provide: gtmImplementation, useValue: mockGtmImplementation },
        { provide: ElementRef, useValue: mockElementRef },
        { provide: CookieService, useValue: mockCookieService },
        FormBuilder
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents()

    fixture = TestBed.createComponent(OtherDetailsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('functions', () => {
    component.onInputChange('primaryFinancialSource', 'Parents')
    component.nextButton()
    component.backButton()
    component.ngOnInit()
  })

  it('Form controls and patch values', () => {
    const questions = [
      {
        displayFormat: { value: 'SELECT_BOX' },
        mappingField: 'primaryFinancialSource'
      },
      {
        displayFormat: { value: 'SELECT_BOX' },
        mappingField: 'howDidYouHear'
      }
    ]

    component.generateFormControl(questions)

    expect(component.otherDetailsForm.contains('primaryFinancialSource')).toBe(true)
    expect(component.otherDetailsForm.contains('howDidYouHear')).toBe(true)
  })

  it('should handle error in getProgressiveProfileQstns', () => {
    mockPPService.getPPqstns.mockReturnValue(throwError(() => new Error('error')))
    component.questions = undefined
    component.getProgressiveProfileQstns()
  })

  it('should fetch questions via API when serviceQuestions is undefined', () => {
    mockPPService.getPPqstns.mockReturnValue(of({
      items: [{ fields: { questions: [{ mappingField: 'test', displayFormat: { value: 'SELECT_BOX' } }] } }]
    }))
    component.ProgressiveProfileQuestionsService.serviceQuestions = undefined
    component.getProgressiveProfileQstns()
    expect(component.showLoader).toBe(false)
  })

  it('should handle error and navigate to /error when getPPqstns fails', () => {
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
            }
          ]
        }
      }]
    }
    component.getProgressiveProfileQstns()
    component.generateFormControl(component.ProgressiveProfileQuestionsService.serviceQuestions?.items[0]?.fields?.questions)
  })

  it('should handle generateFormControl when questions are undefined', () => {
    component.generateFormControl(undefined)
    expect(component.otherDetailsForm).toBeDefined()
  })

  it('should delete value if event.selected is false', () => {
    const deleteSpy = jest.spyOn(mockUserInputService, 'deleteValue')
    component.onInputChange('testField', 'value', { selected: false })
    expect(deleteSpy).toHaveBeenCalledWith('testField')
  })

  it('should call trackEvents and emit nextClicked when form is valid', () => {
    const trackSpy = jest.spyOn(mockGtmImplementation, 'trackEvents')
    const emitSpy = jest.spyOn(component.nextClicked, 'emit')

    component.otherDetailsForm = new FormControl('dummy') as any
    Object.defineProperty(component.otherDetailsForm, 'valid', { get: () => true })

    component.nextButton()
    expect(trackSpy).toHaveBeenCalled()
    expect(emitSpy).toHaveBeenCalled()
  })

  it('should emit backClicked event', () => {
    const spy = jest.spyOn(component.backClicked, 'emit')
    component.backButton()
    expect(spy).toHaveBeenCalled()
  })

  describe('submitOtherDetailsForm - invalid case', () => {
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

      component.otherDetailsForm.setErrors({ invalid: true })

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

      component.otherDetailsForm.setErrors({ invalid: true })

      component.nextButton()
      jest.runAllTimers()

      expect(invalidEl.scrollIntoView).toHaveBeenCalled()
      expect(invalidEl.focus).toHaveBeenCalled()
      expect(invalidEl.classList.contains('scroll-field-error')).toBe(true)
    })
  })
})
