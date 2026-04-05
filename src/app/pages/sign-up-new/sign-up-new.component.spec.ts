import { ComponentFixture, TestBed } from '@angular/core/testing'
import { SignUpNewComponent } from './sign-up-new.component'
import { CookieService } from 'ngx-cookie-service'
import { UserInputService } from 'src/app/common/api/services/user-input.service'
import { Router } from '@angular/router'
import { gtmImplementation } from 'src/app/common/api/services/gtmImplementation'

jest.mock('../../common/json/sign-up-content', () => ({
  languageContent: {
    EN: {
      registrationFormHeading: 'Test Heading',
      numberOfQuestionsText: 'Test Questions Text'
    },
    IN_TA: {
      registrationFormHeading: 'test_data',
      numberOfQuestionsText: 'test_data'
    }
  }
}))

describe('SignUpNewComponent', () => {
  let component: SignUpNewComponent
  let fixture: ComponentFixture<SignUpNewComponent>
  const routerSpy = { navigateByUrl: jest.fn() }

  const mockCookieService = {
    get: jest.fn()
  }
  

  const mockUserInputService = {
    setValue: jest.fn()
  }

  const mockGtmImplementation = {
  trackEvents: jest.fn()
  }


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SignUpNewComponent],
      providers: [
        { provide: CookieService, useValue: mockCookieService },
        { provide: UserInputService, useValue: mockUserInputService },
        { provide: Router, useValue: routerSpy },
        { provide: gtmImplementation, useValue: mockGtmImplementation }
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(SignUpNewComponent)
    component = fixture.componentInstance
    jest.spyOn(component as any, 'selectedComponent')
    fixture.detectChanges()
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize values from cookies/localStorage in ngOnInit', () => {
    expect(component.selectedLanguage).toBe('EN')
    expect(component.formHeading).toBe('Test Heading')
    expect(component.numberOfQuestions).toBe('Test Questions Text')
  })

  it('should update currentNumber in selectedComponent()', () => {
    component.selectedComponent(2)
    expect(component.currentNumber).toBe(2)
  })

  it('should update currentNumber and enable step 2 in onPersonalDetailsNext()', () => {
    component.onPersonalDetailsNext()
    expect(component.currentNumber).toBe(2)
  })

  it('should update currentNumber and enable step 3 in onOtherDetailsNext()', () => {
    component.onOtherDetailsNext()
    expect(component.currentNumber).toBe(3)
  })

  it('should go back to step 1 on onOtherDetailsBack()', () => {
    component.onOtherDetailsBack()
    expect(component.currentNumber).toBe(1)
  })

  it('should go back to step 2 on onReviewDetailsBack()', () => {
    component.onReviewDetailsBack()
    expect(component.currentNumber).toBe(2)
  })

  it('should close messageBox', () => {
    component.messageBox()
    expect(component.messageBoxopen).toBe(false)
  })

  it('function triggerNextFromOtherDetails', () => {
    component.currentNumber = 2
    component.otherDetailsComponent = {
      nextButton: jest.fn()
    } as any
    component.triggerNextFromOtherDetails()
  })

  it('function triggerNextFromPersonalDetails ', () => {
    component.currentNumber = 1
    component.PersonalDetailsComponent = {
      nextButton: jest.fn()
    } as any
    component.triggerNextFromPersonalDetails()
  })

  it('function triggerNextFromPersonalDetails ', () => {
    component.currentNumber = 0
    component.PersonalDetailsComponent = {
      nextButton: jest.fn()
    } as any
    component.triggerNextFromPersonalDetails()
  })

  it('should handle clickedReview', () => {
    component.PersonalDetailsComponent = {
      nextButton: jest.fn()
    } as any
    component.otherDetailsComponent = {
      nextButton: jest.fn()
    } as any

    component.currentNumber = 1
    component.clickedReview(3)
    component.currentNumber = 2
    component.clickedReview(3)

    component.currentNumber = 1
    component.clickedReview(2)
    component.currentNumber = 3
    component.clickedReview(2)

    component.clickedReview(1)

    component.clickedNumber = 3
    component.onPersonalDetailsNext()
  })

  it('should initialize values correctly when language is not EN', () => {
    localStorage.setItem('languageSelected', 'TA')
    localStorage.setItem('isExistingUser', 'true')
    mockCookieService.get.mockReturnValue('IN')

    component.ngOnInit()

    expect(component.selectedLanguage).toBe('TA')
    expect(component.countryCode).toBe('IN')
    expect(component.formHeading).toBe('test_data')
    expect(component.numberOfQuestions).toBe('test_data')
  })

  it('should warn if otherDetailsComponent is undefined in onPersonalDetailsNext', () => {
    component.clickedNumber = 3
    component.currentNumber = 1
    component.otherDetailsComponent = undefined as any
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

    component.onPersonalDetailsNext()

    expect(component.showLoader).toBe(true)

    setTimeout(() => {
      expect(warnSpy).toHaveBeenCalledWith('otherDetailsComponent is still undefined')
      warnSpy.mockRestore()
    }, 600)
  })

  it('should fallback safely when clickedNumber is not 1/2/3 in clickedReview', () => {
    component.clickedReview(99)
    expect(component.clickedNumber).toBe(99)
  })

  it('should set isExistingUser to false if not in localStorage', () => {
    localStorage.removeItem('isExistingUser')
    component.ngOnInit()
    expect(component.isExistingUser).toBe('false')
  })

  it('should handle unknown language and countryCode fallback', () => {
    localStorage.setItem('languageSelected', 'FAKE_LANG')
    mockCookieService.get.mockReturnValue('ZZ')

    expect(() => component.ngOnInit()).not.toThrow()
    expect(component.formHeading).toBeUndefined()
  })

  it('should not trigger next if currentNumber already matches clickedNumber', () => {
    component.clickedNumber = 2
    component.currentNumber = 2
    const spy = jest.spyOn(component, 'triggerNextFromPersonalDetails')
    component.clickedReview(2)
    expect(spy).not.toHaveBeenCalled()
  })
})
