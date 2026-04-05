import { ComponentFixture, TestBed } from '@angular/core/testing'
import { PageNotFoundComponent } from './page-not-found.component'
import { Router } from '@angular/router'
import { CookieService } from 'ngx-cookie-service'
import { environment } from 'src/environments/environment'

describe('PageNotFoundComponent', () => {
  let component: PageNotFoundComponent
  let fixture: ComponentFixture<PageNotFoundComponent>
  let routerMock: any
  let cookieServiceMock: any
  let originalDemoMode: boolean

  beforeEach(() => {
    originalDemoMode = environment.demoMode
    environment.demoMode = false
    routerMock = {
      navigateByUrl: jest.fn()
    }

    cookieServiceMock = {
      get: jest.fn().mockReturnValue('test-office-id')
    }

    Object.defineProperty(window, 'location', {
      value: {
        origin: 'https://example.com',
        pathname: '/thankyou',
        href: 'https://example.com/thankyou'
      },
      writable: true
    })

    // ✅ This is the key fix
    jest.spyOn(history, 'pushState').mockImplementation(() => {})

    TestBed.configureTestingModule({
      declarations: [PageNotFoundComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: CookieService, useValue: cookieServiceMock }
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(PageNotFoundComponent)
    component = fixture.componentInstance
  })

  afterEach(() => {
    environment.demoMode = originalDemoMode
  })

  describe('ngOnInit', () => {
    it('should set registrationPage to true if localStorage has detailsPage=true', () => {
      localStorage.setItem('detailsPage', 'true')
      component.ngOnInit()
      expect(component.registrationPage).toBe(true)
    })

    it('should set registrationPage to false if localStorage has detailsPage=false', () => {
      localStorage.setItem('detailsPage', 'false')
      component.ngOnInit()
      expect(component.registrationPage).toBe(false)
    })
  })

  describe('routeToHomePage', () => {
    it('should redirect to students page with officeId', () => {
      const assignMock = jest.fn()
      Object.defineProperty(window, 'location', {
        value: { origin: 'https://example.com', href: '', assign: assignMock },
        writable: true
      })

      component.routeToHomePage()

      expect(cookieServiceMock.get).toHaveBeenCalledWith('officeId')
      expect(window.location.href).toBe('https://example.com/students?officeId=test-office-id')
    })
  })

  describe('routeToRegistrationPage', () => {
    it('should navigate to /signupnew', () => {
      component.routeToRegistrationPage()
      expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/signupnew')
    })
  })

  describe('reroute', () => {
    it('should call routeToRegistrationPage if registrationPage is true', () => {
      component.registrationPage = true
      const regSpy = jest.spyOn(component, 'routeToRegistrationPage')
      component.reroute()
      expect(regSpy).toHaveBeenCalled()
    })

    it('should call routeToHomePage if registrationPage is false', () => {
      component.registrationPage = false
      const homeSpy = jest.spyOn(component, 'routeToHomePage')
      component.reroute()
      expect(homeSpy).toHaveBeenCalled()
    })
  })

  describe('handleBack', () => {
    it('should call reroute if pathname contains /signupnew', () => {
      window.location.pathname = '/signupnew'
      const rerouteSpy = jest.spyOn(component, 'reroute')
      component.handleBack(new PopStateEvent('popstate'))
      expect(rerouteSpy).toHaveBeenCalled()
    })

    it('should call reroute if pathname contains /thankyou', () => {
      window.location.pathname = '/thankyou'
      const rerouteSpy = jest.spyOn(component, 'reroute')
      component.handleBack(new PopStateEvent('popstate'))
      expect(rerouteSpy).toHaveBeenCalled()
    })

    it('should not call reroute if pathname does not include /signupnew or /thankyou', () => {
      window.location.pathname = '/other-page'
      const rerouteSpy = jest.spyOn(component, 'reroute')
      component.handleBack(new PopStateEvent('popstate'))
      expect(rerouteSpy).not.toHaveBeenCalled()
    })
  })
})
