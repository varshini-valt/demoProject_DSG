import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core'
import { Router } from '@angular/router'
import { language } from '../../../common/json/language'
import { signOut } from '@aws-amplify/auth'
import { CookieService } from 'ngx-cookie-service'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent implements OnInit {
  @HostListener('window:popstate', ['$event'])
  handleBack (_: PopStateEvent): void {
    if (!(window.location.pathname.includes('/signupnew') || window.location.pathname.includes('/thankyou'))) {
      return
    }
    history.pushState(null, '', window.location.href)
    this.signoutPopup()
  }

  showLanguageSwitcher: boolean = false
  showBackButton: boolean = false
  showSignoutPopup: boolean = false
  registrationPage: boolean = false
  thankyouPage: boolean = false
  country: any
  showLoader: boolean = false

  @Output() languageChanged = new EventEmitter<string>()
  languageData: any
  defaultLanguage = 'EN'
  constructor (
    public route: Router,
    public cookieService: CookieService
  ) { }

  async ngOnInit (): Promise<void> {
    if (this.route.url.includes('/signupnew') || this.route.url.includes('/thankyou')) {
      history.pushState(null, '', window.location.href)
    }

    this.country = this.cookieService.get('country')
    this.languageData = language[this.country]
    if (!this.route.url.includes('signup') && !this.route.url.includes('signupnew') && !this.route.url.includes('error') && !this.route.url.includes('thankyou') && await this.languageData?.langVal?.length > 1) {
      this.showLanguageSwitcher = true
    } else {
      this.showLanguageSwitcher = false
    }

    if (this.route.url.includes('qrSignin') || this.route.url.includes('qrSignup')){
      this.showBackButton = true
    }

    if (this.route.url.includes('signupnew')){
      this.registrationPage = true
    }

    if (this.route.url.includes('thankyou')){
      this.thankyouPage = true
    }
  }

  languageChange (language: any): any {
    this.languageChanged.emit(language)
    localStorage.setItem('languageSelected', language.value)
  }

  backClicked (): void {
    if (environment.demoMode) {
      this.route?.navigateByUrl('/')
      return
    }
    this.showLoader = true
    const officeId = this.cookieService.get('officeId')
    const targetUrl = `/students?officeId=${encodeURIComponent(officeId)}`
    const fullUrl = `${window.location.origin}${targetUrl}`
    window.location.href = fullUrl
    this.showLoader = false
  }

  signoutPopup (): void {
    this.showSignoutPopup = !this.showSignoutPopup

    if (this.showSignoutPopup) {
      document.body.classList.add('no-scroll')
    } else {
      document.body.classList.remove('no-scroll')
    }
  }

  async signout (): Promise<any> {
    this.showSignoutPopup = false
    document.body.classList.remove('no-scroll')
    this.showLoader = true

    if (environment.demoMode) {
      // Demo mode: simulate sign-out
      sessionStorage.clear()
      localStorage.clear()
      this.showLoader = false
      this.route?.navigateByUrl('/')
      return
    }

    await signOut({ global: true })
      .then((res) => {
        sessionStorage.clear()
        localStorage.clear()
        this.showLoader = true
        const officeId = this.cookieService.get('officeId')
        const targetUrl = `/students?officeId=${encodeURIComponent(officeId)}`
        const fullUrl = `${window.location.origin}${targetUrl}`
        window.location.href = fullUrl
        this.showLoader = false
      }).catch((error) => {
        console.log('Error in sign out:', error)
        this.route?.navigateByUrl('/error')
        this.showLoader = false
      })
  }
}
