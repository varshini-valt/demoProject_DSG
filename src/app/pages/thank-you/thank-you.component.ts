import { Component, OnInit } from '@angular/core'
import { thankYouContent } from '../../common/json/thank-you-page-content'
import { CookieService } from 'ngx-cookie-service'
import { Router } from '@angular/router'
import { ViewportScroller } from '@angular/common'
import { UserInputService } from 'src/app/common/api/services/user-input.service'
import { gtmImplementation } from 'src/app/common/api/services/gtmImplementation'

@Component({
  selector: 'app-thank-you',
  templateUrl: './thank-you.component.html',
  styleUrls: ['./thank-you.component.css']
})
export class ThankYouComponent implements OnInit {
  isExistingUser: any
  selectedLanguage: any
  thankYouContentPage: any
  countryCode: any
  maliciousUser: any
  allData: { [key: string]: any } = {}
  constructor (
    public cookieService: CookieService,
    public viewPortScroller: ViewportScroller,
    public userInputService: UserInputService,
    public route: Router,
    public gtmImplementation: gtmImplementation) {}

  ngOnInit (): void {
    this.viewPortScroller.scrollToPosition([0, 0])
    this.maliciousUser = localStorage.getItem('maliciousUser') ? localStorage.getItem('maliciousUser') : 'false'
    this.gtmImplementation.pageView('thank_you', 'signed_in_user', 'user_registration')
    this.countryCode = this.cookieService.get('countrycode')
    localStorage.setItem('detailsPage', 'false')
    this.isExistingUser = localStorage.getItem('isExistingUser') ? localStorage.getItem('isExistingUser') : 'false'
    this.allData = this.userInputService.getAllValues()
    this.getContent()
  }

  getContent (): any {
    this.selectedLanguage = localStorage.getItem('languageSelected') ? localStorage.getItem('languageSelected') : 'EN'
    if (this.selectedLanguage === 'EN') {
      this.thankYouContentPage = thankYouContent[this.selectedLanguage]
    } else {
      this.thankYouContentPage = thankYouContent[this.countryCode + '_' + this.selectedLanguage]
    }
  }

  doneButton (): any {
    sessionStorage.clear()
    localStorage.clear()
    this.route?.navigateByUrl('/')
  }
}