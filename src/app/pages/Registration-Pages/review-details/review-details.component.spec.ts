import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ReviewDetailsComponent } from './review-details.component'
import { Router } from '@angular/router'
import { of, throwError } from 'rxjs'
import { UserInputService } from 'src/app/common/api/services/user-input.service'
import { ProgressiveProfileQuestionsService } from 'src/app/common/api/services/progressive-profile-qsts.service'
import { CookieService } from 'ngx-cookie-service'
import { WIRService } from 'src/app/common/api/services/wir.service'
import { gtmImplementation } from 'src/app/common/api/services/gtmImplementation'

const mockGtmImplementation = {
  pageView: jest.fn(),
  trackEvents: jest.fn(),
  trackKPI: jest.fn()
}

describe('ReviewDetailsComponent', () => {
  let component: ReviewDetailsComponent
  let fixture: ComponentFixture<ReviewDetailsComponent>
  const routerSpy = { navigateByUrl: jest.fn() }

  const mockCookieService = {
    get: jest.fn((key: string) => {
      const map: { [key: string]: string } = {
        country: 'India',
        officeId: '/HIN01',
        countrycode: 'IN',
        wirCounsellorTeam: 'WIR_T01'
      }
      return map[key] || ''
    })
  }

  const userInputMock = {
    getAllValues: jest.fn(() => ({
      interestedIDPSerivce: [
        { option_value: 'Visa' },
        { option_value: 'IELTS' }
      ]
    })),
    getValue: jest.fn((key: string) => {
      const values: any = {
        primary_mobile_number: { option_label: '9876543210', option_value: '9876543210' },
        dialCode: { option_label: '+91' },
        first_name: { option_value: 'John' },
        last_name: { option_value: 'Doe' },
        gender: { option_value: 'Male' },
        date_of_birth_API: '1990-01-01',
        maritalStatus: { option_value: 'Single' },
        passport: { option_value: 'Yes' },
        nationalityCode: { option_value: 'IN' },
        preferredCountryCode: { option_value: 'AU' },
        preferredStudyLevel: { option_value: 'Bachelors' },
        studyPlanTimeline: { option_value: 'Now' },
        primaryFinancialSource: { option_value: 'Family' },
        howDidYouHear: { option_value: 'Friend' },
        marketing_acceptance_flag: { option_value: true },
        interestedIDPSerivce: [
          { option_value: 'IDP01' },
          { option_value: 'IDP02' },
          { option_value: 'IDP03' }
        ],
        cookies: 'false'
      }
      return values[key]
    })
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReviewDetailsComponent],
      providers: [
        { provide: UserInputService, useValue: userInputMock },
        { provide: gtmImplementation, useValue: mockGtmImplementation },
        { provide: CookieService, useValue: mockCookieService },
        {
          provide: ProgressiveProfileQuestionsService,
          useValue: {
            getPPqstns: jest.fn(() =>
              of({ items: [{ fields: { questions: [{ mappingField: 'mockField' }] } }] })
            ),
            serviceQuestions: undefined
          }
        },
        { provide: WIRService, useValue: { userRegistrationForm: jest.fn(() => of({})) } },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(ReviewDetailsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize data and load questions', () => {
    component.ngOnInit()
    expect(component.country).toBe('India')
    expect(component.countryCode).toBe('IN')
    expect(component.phoneNumber).toBe('+91 9876543210')
  })

  it('should emit backClicked on backButton()', () => {
    const spy = jest.spyOn(component.backClicked, 'emit')
    component.backButton()
    expect(spy).toHaveBeenCalled()
  })

  it('should call userRegistrationForm and navigate to thankyou on success', () => {
    const wirService = TestBed.inject(WIRService)
    const spy = jest.spyOn(wirService, 'userRegistrationForm').mockReturnValueOnce(of({}))
    component.submitRegistrationForm()
    expect(spy).toHaveBeenCalled()
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/thankyou')
  })

  it('should navigate to error page on userRegistrationForm error', () => {
    const wirService = TestBed.inject(WIRService)
    jest.spyOn(wirService, 'userRegistrationForm').mockReturnValueOnce(
      throwError(() => ({ error: { message: 'Invalid request body' } }))
    )
    component.submitRegistrationForm()
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/error')
  })

  it('should navigate to error on getProgressiveProfileQstns error', () => {
    const ppService = TestBed.inject(ProgressiveProfileQuestionsService)
    jest.spyOn(ppService, 'getPPqstns').mockReturnValueOnce(throwError(() => new Error('error')))
    component.getProgressiveProfileQstns()
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/error')
  })

  it('should call gtmImplementation.trackKPI when cookies flag is true', () => {
    const wirService = TestBed.inject(WIRService)
    jest.spyOn(wirService, 'userRegistrationForm').mockReturnValueOnce(of({}))

    userInputMock.getValue = jest.fn((key: string) => {
      if (key === 'cookies') return 'true'
      return {
        option_value: 'mockValue',
        option_label: 'mockLabel'
      }
    })

    component.submitRegistrationForm()

    expect(mockGtmImplementation.trackKPI).toHaveBeenCalledWith(
      'wir_user_registration_submit',
      'submit',
      'submit_button',
      'user_registration',
      'review_details',
      'signed_in_user'
    )
  })

  it('should call pageView when cookies are true during ngOnInit', () => {
    const pageViewSpy = jest.spyOn(mockGtmImplementation, 'pageView')
    component.ngOnInit()
    expect(pageViewSpy).toHaveBeenCalledWith('review_details', 'signed_in_user', 'user_registration')
  })

  it('should handle dialCode.option_label as object', () => {
    userInputMock.getValue = jest.fn((key: string) => {
      if (key === 'dialCode') return { option_label: { dialCode: '+44' } }
      if (key === 'primary_mobile_number') return { option_label: '1234567890' }
      return { option_value: 'mock' }
    })

    component.ngOnInit()
    expect(component.phoneNumber).toBe('+44 1234567890')
  })

  it('should set marketingAcceptanceIndicator false when undefined', () => {
    userInputMock.getValue = jest.fn((key: string) => {
      if (key === 'marketing_acceptance_flag') return { option_value: undefined }
      if (key === 'cookies') return 'false'
      return { option_value: 'mock', option_label: 'mock' }
    })
    component.ngOnInit()
  })

  it('should call gtmImplementation.trackEvents on backButton', () => {
    component.backButton()
    expect(mockGtmImplementation.trackEvents).toHaveBeenCalledWith(
      'wir_review_details',
      'back_button',
      'back',
      'review_details',
      'signed_in_user',
      'user_registration'
    )
  })
})
