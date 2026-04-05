import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ThankYouComponent } from './thank-you.component'
import { NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { CookieService } from 'ngx-cookie-service'
import { gtmImplementation } from 'src/app/common/api/services/gtmImplementation'
import { ViewportScroller } from '@angular/common'
import { Router } from '@angular/router'
import { UserInputService } from 'src/app/common/api/services/user-input.service'

describe('ThankYouComponent', () => {
  let component: ThankYouComponent
  let fixture: ComponentFixture<ThankYouComponent>

  const mockCookieService = {
    get: jest.fn((key: string) => {
      const map: { [key: string]: string } = {
        country: 'India',
        officeId: 'HIN01',
        countrycode: 'IN'
      }
      return map[key] || ''
    })
  }

  const mockViewportScroller = {
    scrollToPosition: jest.fn()
  }

  const mockRouter = {
    navigateByUrl: jest.fn()
  }

  const mockUserInputService = {
    getValue: jest.fn(),
    getAllValues: jest.fn(() => ({ test: 'value' }))
  }

  const mockGtmImplementation = {
    pageView: jest.fn(),
    trackEvents: jest.fn(),
    trackKPI: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()

    TestBed.configureTestingModule({
      declarations: [ThankYouComponent],
      providers: [
        { provide: CookieService, useValue: mockCookieService },
        { provide: ViewportScroller, useValue: mockViewportScroller },
        { provide: Router, useValue: mockRouter },
        { provide: UserInputService, useValue: mockUserInputService },
        { provide: gtmImplementation, useValue: mockGtmImplementation }
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]
    })

    fixture = TestBed.createComponent(ThankYouComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should call gtmImplementation.pageView', () => {
    localStorage.setItem('maliciousUser', 'true')
    localStorage.setItem('isExistingUser', 'true')

    component.ngOnInit()

    expect(mockViewportScroller.scrollToPosition).toHaveBeenCalledWith([0, 0])
    expect(mockGtmImplementation.pageView).toHaveBeenCalledWith('thank_you', 'signed_in_user', 'user_registration')
    expect(component.maliciousUser).toBe('true')
    expect(component.isExistingUser).toBe('true')
    expect(component.countryCode).toBe('IN')
    expect(component.allData).toEqual({ test: 'value' })
  })

  it('should set EN content if languageSelected is EN', () => {
    localStorage.setItem('languageSelected', 'EN')
    component.countryCode = 'IN'
    component.getContent()
    expect(component.selectedLanguage).toBe('EN')
    expect(component.thankYouContentPage).toBeDefined()
  })

  it('should set non-EN content if languageSelected is different', () => {
    localStorage.setItem('languageSelected', 'THA')
    component.countryCode = 'IN'
    component.getContent()
  })

  it('should navigate to / on doneButton', () => {
    component.doneButton()
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/')
  })
})
