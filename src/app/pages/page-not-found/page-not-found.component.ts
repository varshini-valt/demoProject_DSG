import { Component, HostListener } from '@angular/core'
import { Router } from '@angular/router'
import { CookieService } from 'ngx-cookie-service'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.css']
})
export class PageNotFoundComponent {
  @HostListener('window:popstate', ['$event'])
  handleBack (_: PopStateEvent): void {
    if (!(window.location.pathname.includes('/signupnew') || window.location.pathname.includes('/thankyou'))) {
      return
    }
    history.pushState(null, '', window.location.href)
    this.reroute()
  }

  registrationPage: boolean = false
  constructor (public route: Router,
    public cookieService: CookieService
  ){}

  ngOnInit (): any{
    history.pushState(null, '', window.location.href)
    if (localStorage.getItem('detailsPage') === 'true'){
      this.registrationPage = true
    } else {
      this.registrationPage = false
    }
  }

  routeToHomePage (): any{
    if (environment.demoMode) {
      this.route?.navigateByUrl('/')
      return
    }
    const officeId = this.cookieService.get('officeId')
    const targetUrl = `/students?officeId=${encodeURIComponent(officeId)}`
    const fullUrl = `${window.location.origin}${targetUrl}`
    window.location.href = fullUrl
  }

  routeToRegistrationPage (): any{
    this.route?.navigateByUrl('/signupnew')
  }

  reroute (): any{
    if (this.registrationPage){
      this.routeToRegistrationPage()
    } else {
      this.routeToHomePage()
    }
  }
}
