import { TestBed } from '@angular/core/testing'
import { RouterTestingModule } from '@angular/router/testing'
import { AppComponent } from './app.component'
import { environment } from 'src/environments/environment'
import { CookieService } from 'ngx-cookie-service'

describe('AppComponent', () => {
  let component: AppComponent
  let fixture: any
  let originalReload: any
  let originalCookie: string
  let mockCookieService: any

  beforeAll(() => {
    originalReload = window.location.reload
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload: jest.fn() },
      writable: true
    })
  })

  afterAll(() => {
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload: originalReload },
      writable: true
    })
  })

  beforeEach(() => {
    originalCookie = document.cookie
    document.head.innerHTML = ''
    document.body.innerHTML = ''
    document.cookie = ''
    jest.clearAllMocks()

    mockCookieService = {
      get: jest.fn().mockReturnValue(''),
      set: jest.fn(),
      delete: jest.fn()
    }

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppComponent],
      providers: [
        { provide: CookieService, useValue: mockCookieService }
      ]
    })

    fixture = TestBed.createComponent(AppComponent)
    component = fixture.componentInstance

    ;(component as any).hasReloadedAfterConsent = false
    delete (window as any).OneTrust
  })

  afterEach(() => {
    document.cookie = originalCookie
    if ((component as any).listenerRetryTimeout) {
      clearTimeout((component as any).listenerRetryTimeout)
    }
  })

  describe('Component Initialization', () => {
    it('should create the app', () => {
      expect(component).toBeTruthy()
    })

    it('should have correct title', () => {
      expect(component.title).toBe('WIR Angular')
    })

    it('should initialize with correct default values', () => {
      expect(component.consentGiven).toBe(false)
      expect((component as any).hasReloadedAfterConsent).toBe(false)
      expect((component as any).COOKIE_NAME).toBe('OptanonAlertBoxClosed')
    })

    it('should call loadOneTrustScript, setupConsentListener and injectGtm in ngOnInit', () => {
      const loadSpy = jest.spyOn(component, 'loadOneTrustScript')
      const listenerSpy = jest.spyOn(component as any, 'setupConsentListener')
      const injectSpy = jest.spyOn(component as any, 'injectGtm')

      component.ngOnInit()

      expect(loadSpy).toHaveBeenCalled()
      expect(listenerSpy).toHaveBeenCalled()
      expect(injectSpy).toHaveBeenCalled()
    })

    it('should call setupDemoCookies when demoMode is true', () => {
      const setupSpy = jest.spyOn(component as any, 'setupDemoCookies')
      component.ngOnInit()
      if (environment.demoMode) {
        expect(setupSpy).toHaveBeenCalled()
      }
    })
  })

  describe('OneTrust Script Loading', () => {
    it('should load OneTrust script with correct attributes', () => {
      component.loadOneTrustScript()

      const scripts = Array.from(document.body.querySelectorAll('script'))
      const oneTrustScript = scripts.find(s => s.src.includes('otSDKStub.js'))

      expect(oneTrustScript).toBeTruthy()
      expect(oneTrustScript?.getAttribute('data-domain-script')).toBe(environment.oneTrustDomainScript)
      expect(oneTrustScript?.type).toBe('text/javascript')
      expect(oneTrustScript?.charset).toBe('UTF-8')
    })

    it('should create OptanonWrapper function script', () => {
      component.loadOneTrustScript()

      const scripts = Array.from(document.body.querySelectorAll('script'))
      const wrapperScript = scripts.find(s => s.text.includes('OptanonWrapper'))

      expect(wrapperScript).toBeTruthy()
      expect(wrapperScript?.text).toBe('function OptanonWrapper() { }')
    })

    it('should add start and end comments', () => {
      component.loadOneTrustScript()

      const comments = Array.from(document.body.childNodes)
        .filter(node => node.nodeType === Node.COMMENT_NODE)
        .map(node => node.textContent)

      expect(comments).toContain(' OneTrust Cookies Consent Notice start for dsg.com ')
      expect(comments).toContain(' OneTrust Cookies Consent Notice end for dsg.com ')
    })
  })

  describe('Cookie Management', () => {
    it('should return null when cookie does not exist', () => {
      document.cookie = ''
      const result = (component as any).getCookie('nonexistent')
      expect(result).toBeNull()
    })

    it('should return cookie value when cookie exists', () => {
      document.cookie = 'OptanonAlertBoxClosed=test-value'
      const result = (component as any).getCookie('OptanonAlertBoxClosed')
      expect(result).toBe('test-value')
    })

    it('should handle encoded cookie values', () => {
      const encodedValue = encodeURIComponent('test value with spaces')
      document.cookie = `OptanonAlertBoxClosed=${encodedValue}`
      const result = (component as any).getCookie('OptanonAlertBoxClosed')
      expect(result).toBe('test value with spaces')
    })
  })

  describe('Consent Change Handling', () => {
    it('should reload page when consent is given for first time', () => {
      const reloadSpy = jest.spyOn(window.location, 'reload')
      document.cookie = 'OptanonAlertBoxClosed=true'
      ;(component as any).hasReloadedAfterConsent = false

      ;(component as any).onConsentChanged()

      expect((component as any).hasReloadedAfterConsent).toBe(true)
      expect(reloadSpy).toHaveBeenCalled()
    })

    it('should not reload if already reloaded after consent', () => {
      const reloadSpy = jest.spyOn(window.location, 'reload')
      document.cookie = 'OptanonAlertBoxClosed=true'
      ;(component as any).hasReloadedAfterConsent = true

      ;(component as any).onConsentChanged()

      expect(reloadSpy).not.toHaveBeenCalled()
    })

    it('should not reload if no consent cookie exists', () => {
      const reloadSpy = jest.spyOn(window.location, 'reload')
      const getCookieSpy = jest.spyOn(component as any, 'getCookie').mockReturnValue(null)
      ;(component as any).hasReloadedAfterConsent = false

      ;(component as any).onConsentChanged()

      expect(getCookieSpy).toHaveBeenCalledWith('OptanonAlertBoxClosed')
      expect((component as any).hasReloadedAfterConsent).toBe(false)
      expect(reloadSpy).not.toHaveBeenCalled()
    })
  })

  describe('Consent Listener Setup', () => {
    it('should attach listener when OneTrust is available', () => {
      const mockCallback = jest.fn()
      ;(window as any).OneTrust = {
        OnConsentChanged: jest.fn(cb => {
          mockCallback.mockImplementation(cb)
          cb()
        })
      }

      const onConsentChangedSpy = jest.spyOn(component as any, 'onConsentChanged')
      ;(component as any).setupConsentListener()

      expect((window as any).OneTrust.OnConsentChanged).toHaveBeenCalled()
      expect(onConsentChangedSpy).toHaveBeenCalled()
    })

    it('should retry when OneTrust is not available', () => {
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout')
      delete (window as any).OneTrust

      ;(component as any).setupConsentListener()

      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 300)
    })

    it('should retry when OneTrust exists but OnConsentChanged is not a function', () => {
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout')
      ;(window as any).OneTrust = { OnConsentChanged: 'not a function' }

      ;(component as any).setupConsentListener()

      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 300)
    })
  })

  describe('GTM Injection', () => {
    it('should inject GTM script with correct content', () => {
      ;(component as any).injectGtm()

      const scripts = Array.from(document.head.querySelectorAll('script'))
      const gtmScript = scripts.find(s => s.innerHTML.includes('googletagmanager.com/gtm.js'))

      expect(gtmScript).toBeTruthy()
      expect(gtmScript?.innerHTML).toContain(environment.gtmId)
      expect(gtmScript?.innerHTML).toContain('dataLayer')
      expect(gtmScript?.innerHTML).toContain('gtm.start')
    })

    it('should inject noscript fallback with correct content', () => {
      ;(component as any).injectGtm()

      const noScript = document.body.querySelector('noscript')
      expect(noScript).toBeTruthy()
      expect(noScript?.innerHTML).toContain(environment.gtmId)
      expect(noScript?.innerHTML).toContain('googletagmanager.com/ns.html')
      expect(noScript?.innerHTML).toContain('display:none;visibility:hidden')
    })
  })

  describe('Demo Cookies Setup', () => {
    it('should set demo cookies when not already present', () => {
      mockCookieService.get.mockReturnValue('')
      ;(component as any).setupDemoCookies()
      expect(mockCookieService.set).toHaveBeenCalledWith('country', 'IN')
      expect(mockCookieService.set).toHaveBeenCalledWith('countrycode', 'IN')
      expect(mockCookieService.set).toHaveBeenCalledWith('officeId', 'DEMO_OFFICE')
    })

    it('should not overwrite existing cookies', () => {
      mockCookieService.get.mockReturnValue('existing')
      ;(component as any).setupDemoCookies()
      expect(mockCookieService.set).not.toHaveBeenCalled()
    })
  })

  describe('Component Cleanup', () => {
    it('should clear timeout on ngOnDestroy when timeout exists', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')
      const timeoutId = setTimeout(() => {}, 1000)
      ;(component as any).listenerRetryTimeout = timeoutId

      component.ngOnDestroy()

      expect(clearTimeoutSpy).toHaveBeenCalledWith(timeoutId)
    })

    it('should not throw error on ngOnDestroy when no timeout exists', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')
      ;(component as any).listenerRetryTimeout = undefined

      expect(() => component.ngOnDestroy()).not.toThrow()
      expect(clearTimeoutSpy).not.toHaveBeenCalled()
    })
  })
})
