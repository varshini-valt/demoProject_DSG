import { TestBed } from '@angular/core/testing'
import { ProgressiveProfileQuestionsService } from './progressive-profile-qsts.service'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { Router } from '@angular/router'
import { CookieService } from 'ngx-cookie-service'
import { UuidServiceService } from './uuid-service'
import { environment } from 'src/environments/environment'

describe('ProgressiveProfileQuestionsService', () => {
  let service: ProgressiveProfileQuestionsService
  let httpMock: HttpTestingController
  let router: Router
  let cookieService: CookieService
  let originalDemoMode: boolean

  beforeEach(() => {
    originalDemoMode = environment.demoMode
    environment.demoMode = false
    const routerSpy = { navigateByUrl: jest.fn() }
    const cookieServiceSpy = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn()
    }
    const uuidServiceSpy = { uuidv4: jest.fn().mockReturnValue('test-uuid') }

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ProgressiveProfileQuestionsService,
        { provide: Router, useValue: routerSpy },
        { provide: CookieService, useValue: cookieServiceSpy },
        { provide: UuidServiceService, useValue: uuidServiceSpy }
      ]
    })

    service = TestBed.inject(ProgressiveProfileQuestionsService)
    httpMock = TestBed.inject(HttpTestingController)
    router = TestBed.inject(Router)
    cookieService = TestBed.inject(CookieService)
    localStorage.clear()
  })

  afterEach(() => {
    httpMock.verify()
    environment.demoMode = originalDemoMode
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should call getPPqstns and set values correctly', (done) => {
    const mockResponse = {
      wir_counsellor_team: 'team123',
      fields: { questions: [] }
    }

    jest.spyOn(cookieService, 'get').mockImplementation((key: string) => {
      if (key === 'country') return 'IN'
      if (key === 'officeId') return 'HIN/01'
      return ''
    })

    localStorage.setItem('languageSelected', 'EN')

    service.getPPqstns().subscribe((res) => {
      expect(res).toEqual(mockResponse)
      expect(service.serviceQuestions).toEqual(mockResponse)
      expect(cookieService.delete).toHaveBeenCalledWith('wirCounsellorTeam')
      expect(cookieService.set).toHaveBeenCalledWith('wirCounsellorTeam', 'team123')
      done()
    })

    const req = httpMock.expectOne((request) =>
      request.url === environment.getProgressiveProfileQuestionsApi &&
      request.params.has('lang') &&
      request.params.has('country') &&
      request.params.has('office_id')
    )

    expect(req.request.method).toBe('GET')
    expect(req.request.headers.get('X-Correlation-ID')).toBe('test-uuid')
    expect(req.request.headers.get('Authorization')).toBe('test-uuid')

    req.flush(mockResponse)
  })

  it('should navigate to /error if officeId or country is missing', () => {
    jest.spyOn(cookieService, 'get').mockImplementation((key: string) => {
      if (key === 'country') return ''
      if (key === 'officeId') return ''
      return ''
    })

    const navigateSpy = jest.spyOn(router, 'navigateByUrl')

    const result$ = service.getPPqstns()

    result$.subscribe({
      complete: () => {
        expect(navigateSpy).toHaveBeenCalledWith('/error')
      }
    })
  })

  it('should navigate to /error if officeId or country is missing', () => {
    jest.spyOn(cookieService, 'get').mockImplementation((key: string) => {
      if (key === 'country') return ''
      if (key === 'officeId') return ''
      return ''
    })

    const navigateSpy = jest.spyOn(router, 'navigateByUrl')

    service.getPPqstns().subscribe()

    expect(navigateSpy).toHaveBeenCalledWith('/error')
  })
})
