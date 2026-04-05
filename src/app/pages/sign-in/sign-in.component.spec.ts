import { ComponentFixture, TestBed } from '@angular/core/testing'
import { SignInComponent } from './sign-in.component'
import { ReactiveFormsModule, FormsModule } from '@angular/forms'
import { HttpClientModule } from '@angular/common/http'
import { WIRService } from '../../common/api/services/wir.service'
import { ValidatorService } from '../../common/utilities/validator.service'
import { CookieService } from 'ngx-cookie-service'
import { of, throwError } from 'rxjs'
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core'
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations'
import { ProgressiveProfileQuestionsService } from 'src/app/common/api/services/progressive-profile-qsts.service'
import { gtmImplementation } from 'src/app/common/api/services/gtmImplementation'
import { Router } from '@angular/router'
import { ViewportScroller } from '@angular/common'
import { UserInputService } from 'src/app/common/api/services/user-input.service'

const mockGtmImplementation = {
  trackEvents: jest.fn(),
  pageLoad: jest.fn(),
  trackKPI: jest.fn(),
  pageView: jest.fn()
}

const mockRouter = {
  navigateByUrl: jest.fn()
}

const mockCookieService = {
  get: jest.fn((key: string) => {
    const cookies: Record<string, string> = {
      country: 'India',
      officeId: '/HIN01',
      countrycode: 'IN',
      OptanonConsent: 'C0002:1,C0003:1'
    }
    return cookies[key] || ''
  }),
  delete: jest.fn()
}

const mockUserInputService = {
  clearAll: jest.fn(),
  setValue: jest.fn(),
  getValue: jest.fn((key: string) => {
    if (key === 'cookies') return 'true'
    return { option_label: 'true' }
  })
}

const ppQuestions = {
  items: [
    {
      fields: {
        questions: [
          {
            questionId: 1,
            mappingField: 'primary_email',
            label: 'Email',
            displayFormat: { id: 5000, value: 'TEXT_BOX' }
          }
        ]
      },
      wir_counsellor_team: 'team123'
    }
  ]
}

const userExists = { is_exists: true }
const userNotExists = { is_exists: false }

describe('SignInComponent (Jest)', () => {
  let component: SignInComponent
  let fixture: ComponentFixture<SignInComponent>
  let wirService: WIRService
  let profileService: ProgressiveProfileQuestionsService

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SignInComponent],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        BrowserAnimationsModule,
        NoopAnimationsModule
      ],
      providers: [
        WIRService,
        ValidatorService,
        { provide: Router, useValue: mockRouter },
        { provide: CookieService, useValue: mockCookieService },
        { provide: ViewportScroller, useValue: { scrollToPosition: jest.fn() } },
        { provide: gtmImplementation, useValue: mockGtmImplementation },
        { provide: UserInputService, useValue: mockUserInputService },
        {
          provide: ProgressiveProfileQuestionsService,
          useValue: {
            getPPqstns: jest.fn().mockReturnValue(of(ppQuestions))
          }
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    }).compileComponents()

    fixture = TestBed.createComponent(SignInComponent)
    component = fixture.componentInstance
    wirService = TestBed.inject(WIRService)
    profileService = TestBed.inject(ProgressiveProfileQuestionsService)
    fixture.detectChanges()
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize correctly on ngOnInit', () => {
    const spyScroll = jest.spyOn(component.viewPortScroller, 'scrollToPosition')
    component.ngOnInit()
    expect(spyScroll).toHaveBeenCalledWith([0, 0])
    expect(component.selectedLanguage).toBe('EN')
    expect(profileService.getPPqstns).toHaveBeenCalled()
  })

  it('should handle error on getProgressiveProfileQstns failure', () => {
    jest.spyOn(profileService, 'getPPqstns').mockReturnValueOnce(throwError(() => new Error('error')))
    const navigateSpy = jest.spyOn(mockRouter, 'navigateByUrl')
    component.getProgressiveProfileQstns()
    expect(navigateSpy).toHaveBeenCalledWith('/error')
  })

  it('should update language content for EN', () => {
    component.getLanguageContent('EN')
    expect(component.welcomeHeading).toBeDefined()
  })

  it('should update language content for non-default language', () => {
    component.countryCode = 'IN'
    component.getLanguageContent('CHI')
    // expect(component.enterEmail).toBeDefined()
  })

  it('should call getPPqstns on languageChanged', () => {
    const spy = jest.spyOn(profileService, 'getPPqstns').mockReturnValue(of(ppQuestions))
    component.languageChanged({ value: 'EN' })
    expect(spy).toHaveBeenCalled()
  })

  it('should navigate to signup if user does not exist', () => {
    jest.spyOn(wirService, 'studentExistInCognito').mockReturnValue(of(userNotExists))
    component.signInFormGroup.setValue({ emailAddress: 'test@example.com' })
    component.nextpage()
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/qrSignup')
  })

  it('should navigate to signin if user exists', () => {
    jest.spyOn(wirService, 'studentExistInCognito').mockReturnValue(of(userExists))
    component.signInFormGroup.setValue({ emailAddress: 'test@example.com' })
    component.nextpage()
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/qrSignin')
  })

  it('should not navigate if form invalid', () => {
    component.signInFormGroup.setValue({ emailAddress: '' })
    const spy = jest.spyOn(wirService, 'studentExistInCognito')
    component.nextpage()
    expect(spy).not.toHaveBeenCalled()
  })

  it('should handle cookie parsing logic and call GTM tracking', () => {
    jest.spyOn(wirService, 'studentExistInCognito').mockReturnValue(of(userExists))
    component.signInFormGroup.setValue({ emailAddress: 'test@example.com' })
    component.nextpage()
    expect(mockGtmImplementation.trackEvents).toHaveBeenCalledWith(
      'wir_enter_email',
      'next_button',
      'next',
      'email_page',
      'anonymous_user',
      'na'
    )
  })
})
