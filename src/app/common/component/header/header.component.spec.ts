import { ComponentFixture, TestBed } from '@angular/core/testing'
import { HeaderComponent } from './header.component'
import { Router } from '@angular/router'
import { CookieService } from 'ngx-cookie-service'
import { Location } from '@angular/common'
import * as AmplifyAuth from '@aws-amplify/auth'
import { environment } from 'src/environments/environment'

jest.mock('@aws-amplify/auth', () => ({
  signOut: jest.fn()
}))

describe('HeaderComponent', () => {
  let component: HeaderComponent
  let fixture: ComponentFixture<HeaderComponent>
  let routerSpy: any
  let originalDemoMode: boolean

  beforeEach(async () => {
    originalDemoMode = environment.demoMode
    environment.demoMode = false

    routerSpy = {
      url: '/signup',
      navigateByUrl: jest.fn()
    }

    const cookieServiceSpy = {
      get: jest.fn((key: string) => {
        const map: { [key: string]: string } = {
          country: 'India',
          officeId: '/students/HIN01',
          countrycode: 'IN'
        }
        return map[key] || ''
      }),
      delete: jest.fn()
    }

    await TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: CookieService, useValue: cookieServiceSpy },
        { provide: Location, useValue: {} }
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(HeaderComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  afterEach(() => {
    environment.demoMode = originalDemoMode
  })

  it('should create component', () => {
    expect(component).toBeTruthy()
  })

  it('should set country and languageData on ngOnInit', async () => {
    await component.ngOnInit()
    expect(component.country).toBe('India')
  })

  it('should hide language switcher for specific routes', async () => {
    routerSpy.url = '/signupnew'
    await component.ngOnInit()
    expect(component.showLanguageSwitcher).toBe(false)
  })

  it('should enable back and registration flags based on URL', async () => {
    routerSpy.url = '/qrSignup'
    await component.ngOnInit()
    expect(component.showBackButton).toBe(true)

    routerSpy.url = '/signupnew'
    await component.ngOnInit()
    expect(component.registrationPage).toBe(true)
  })

  it('should emit language on languageChange', () => {
    const lang = { value: 'FR' }
    const spy = jest.spyOn(component.languageChanged, 'emit')
    component.languageChange(lang)
    expect(spy).toHaveBeenCalledWith(lang)
    expect(localStorage.getItem('languageSelected')).toBe('FR')
  })

  it('should navigate on backClicked', () => {
    component.backClicked()
  })

  it('should toggle signoutPopup and body class', () => {
    document.body.classList.remove('no-scroll')
    component.showSignoutPopup = false

    component.signoutPopup()
    expect(component.showSignoutPopup).toBe(true)
    expect(document.body.classList.contains('no-scroll')).toBe(true)

    component.signoutPopup()
    expect(component.showSignoutPopup).toBe(false)
    expect(document.body.classList.contains('no-scroll')).toBe(false)
  })

  it('should call signOut and navigate on success', async () => {
    ;(AmplifyAuth.signOut as jest.Mock).mockResolvedValue({})
    await component.signout()
    expect(AmplifyAuth.signOut).toHaveBeenCalledWith({ global: true })
  })

  it('should navigate to error page on signOut failure', async () => {
    ;(AmplifyAuth.signOut as jest.Mock).mockRejectedValue(new Error('Failed'))
    await component.signout()
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/error')
  })

  it('should navigate to / on backClicked in demoMode', () => {
    environment.demoMode = true
    component.backClicked()
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/')
  })

  it('should navigate to / on signout in demoMode', async () => {
    environment.demoMode = true
    await component.signout()
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/')
  })

  it('should call signoutPopup when pathname includes /signupnew', () => {
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/signupnew',
        href: 'http://localhost/signupnew'
      },
      writable: true
    })

    const spy = jest.spyOn(component, 'signoutPopup')
    component.handleBack(new PopStateEvent('popstate'))
    expect(spy).toHaveBeenCalled()
  })

  it('should call signoutPopup when pathname includes /thankyou', () => {
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/thankyou',
        href: 'http://localhost/thankyou'
      },
      writable: true
    })

    const spy = jest.spyOn(component, 'signoutPopup')
    component.handleBack(new PopStateEvent('popstate'))
    expect(spy).toHaveBeenCalled()
  })

  it('should not call signoutPopup if pathname is irrelevant', () => {
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/some-other-page',
        href: 'http://localhost/some-other-page'
      },
      writable: true
    })

    const spy = jest.spyOn(component, 'signoutPopup')
    component.handleBack(new PopStateEvent('popstate'))
    expect(spy).not.toHaveBeenCalled()
  })
})
