import { Component, OnInit, OnDestroy  } from '@angular/core'
import { environment } from 'src/environments/environment'
import { CookieService } from 'ngx-cookie-service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'WIR Angular'
  consentGiven = false
  private readonly COOKIE_NAME = 'OptanonAlertBoxClosed'
  private hasReloadedAfterConsent = false
  private listenerRetryTimeout?: any

  constructor (private cookieService: CookieService) {}

  ngOnInit (): void {
    if (environment.demoMode) {
      this.setupDemoCookies()
    }
    this.loadOneTrustScript()
    this.setupConsentListener()
    this.injectGtm()
  }

  ngOnDestroy(): void {
    if (this.listenerRetryTimeout) {
      clearTimeout(this.listenerRetryTimeout)
    }
  }

  private setupDemoCookies (): void {
    if (!this.cookieService.get('country')) {
      this.cookieService.set('country', 'IN')
    }
    if (!this.cookieService.get('countrycode')) {
      this.cookieService.set('countrycode', 'IN')
    }
    if (!this.cookieService.get('officeId')) {
      this.cookieService.set('officeId', 'DEMO_OFFICE')
    }
  }
 
  loadOneTrustScript (): void {
    const startComment = document.createComment(' OneTrust Cookies Consent Notice start for dsg.com ')
    document.body.insertBefore(startComment, document.body.firstChild)
 
    const scriptMain = document.createElement('script')
    scriptMain.src = 'https://cdn-apac.onetrust.com/scripttemplates/otSDKStub.js'
    scriptMain.type = 'text/javascript'
    scriptMain.charset = 'UTF-8'
    scriptMain.setAttribute('data-domain-script', environment.oneTrustDomainScript)
    document.body.insertBefore(scriptMain, document.body.nextSibling)
 
    const scriptWrapper = document.createElement('script')
    scriptWrapper.type = 'text/javascript'
    scriptWrapper.text = 'function OptanonWrapper() { }'
    document.body.insertBefore(scriptWrapper, scriptMain.nextSibling)
 
    const endComment = document.createComment(' OneTrust Cookies Consent Notice end for dsg.com ')
    document.body.insertBefore(endComment, scriptWrapper.nextSibling)
  }

  private getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
    return match ? decodeURIComponent(match[2]) : null
  }

   private onConsentChanged(): void {
    const cookieValue = this.getCookie(this.COOKIE_NAME)

    if (cookieValue && !this.hasReloadedAfterConsent) {
      this.hasReloadedAfterConsent = true
      window.location.reload()
    }
  }

  private setupConsentListener(): void {
    const tryAttach = () => {
      const oneTrust = (window as any).OneTrust
      if (oneTrust && typeof oneTrust.OnConsentChanged === 'function') {
        oneTrust.OnConsentChanged(() => this.onConsentChanged())
      } else {
        this.listenerRetryTimeout = setTimeout(() => tryAttach(), 300)
      }
    }
    tryAttach()
  }

  private injectGtm(): void {
    const gtmId = environment.gtmId

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.innerHTML = `
    (function(w,d,s,l,i){
      w[l]=w[l]||[];
      w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
      var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s), dl=l!='dataLayer'?'&l='+l:'';
      j.async=true;
      j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
      f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${gtmId}');
  `;
    document.head.appendChild(script)
    const noScript = document.createElement('noscript')
    noScript.innerHTML = `
    <iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
      height="0" width="0" style="display:none;visibility:hidden"></iframe>
  `;
    document.body.appendChild(noScript)
  }
}