import { Injectable } from '@angular/core'
import * as CryptoJS from 'crypto-js'
import { UserInputService } from 'src/app/common/api/services/user-input.service'
import { CookieService } from 'ngx-cookie-service'

@Injectable({
  providedIn: 'root'
})
export class gtmImplementation {
  constructor (
    public userInputService: UserInputService,
    public cookieService: CookieService){
  }

  private getDataLayer (): any[] {
    (window as any).dataLayer = (window as any).dataLayer || []
    return (window as any).dataLayer
  }

  pageView (pageName: any, userLoginStatus: any, featureGTM: any): any{
    const payload:any = {
      event: 'pageview',
      destination_country: this.userInputService.getValue('preferredCountryCode')?.option_label.replace(/ /g, '_').toLowerCase() || 'na',
      feature: featureGTM,
      institution_id: 'na',
      institution_name: 'na',
      keyword: 'na',
      pagename: pageName,
      parent_category: 'na',
      qualification_type: 'na',
      referral_page: 'na',
      office_id: this.cookieService.get('wirCounsellorTeam').toLowerCase(),
      study_level: this.userInputService.getValue('preferredStudyLevel')?.option_label.replace(/ /g, '_').toLowerCase() || 'na',
      intake_year: this.userInputService.getValue('studyPlanTimeline')?.option_label.replace(/ /g, '_').toLowerCase() || 'na',
      office_location: 'na',
      user_login_status: userLoginStatus,
    }

    if(pageName!== 'email_page' && pageName!== 'sign_in' && pageName!== 'sign_up' && pageName!== 'forgot_pwd_success' && pageName!== 'forgot_pwd_email_id' && pageName!== 'forgot_pwd_otp_and_password'){
      payload.user_id = CryptoJS.SHA256(this.userInputService.getValue('primary_email')?.option_label || '').toString(CryptoJS.enc.Hex)
    }
    this.getDataLayer().push(payload);
  }

  trackKPI (eventnameGTM: any, eventActionGTM: any, eventLabelGTM: any, featureGTM: any, pagenameGTM: any, userLoginStatus: any): any{
    this.getDataLayer().push({
      event: 'Track_KPI',
      eventname: eventnameGTM,
      event_action: eventActionGTM,
      event_label: eventLabelGTM,
      feature: featureGTM,
      pagename: pagenameGTM,
      office_id: this.cookieService.get('wirCounsellorTeam').toLowerCase(),
      user_login_status: userLoginStatus,
      destination_country: this.userInputService.getValue('preferredCountryCode')?.option_label.replace(/ /g, '_').toLowerCase() || 'na',
      intake_year: this.userInputService.getValue('studyPlanTimeline')?.option_label?.replace(/ /g, '_').toLowerCase() || 'na',
      office_location: 'na',
      study_level: this.userInputService.getValue('preferredStudyLevel')?.option_label.replace(/ /g, '_').toLowerCase() || 'na',
      user_id: CryptoJS.SHA256(this.userInputService.getValue('primary_email')?.option_label).toString(CryptoJS.enc.Hex)
    })
  }

  trackEvents (eventnameGTM: any, eventLabelGTM: any, eventActionGTM: any, pagenameGTM: any, userLoginStatusGTM: any, featureGTM: any): any{
    const payload: any = {
      event: 'track_events',
      eventname: eventnameGTM,
      event_label: eventLabelGTM,
      event_action: eventActionGTM,
      course_id: 'na',
      course_title: 'na',
      destination_country: this.userInputService.getValue('preferredCountryCode')?.option_label.replace(/ /g, '_').toLowerCase() || 'na',
      feature: featureGTM,
      institution_id: 'na',
      institution_name: 'na',
      keyword: 'na',
      pagename: pagenameGTM,
      parent_category: 'na',
      qualification_type: 'na',
      referral_page: 'na',
      study_level: this.userInputService.getValue('preferredStudyLevel')?.option_label.replace(/ /g, '_').toLowerCase() || 'na',
      intake_year: this.userInputService.getValue('studyPlanTimeline')?.option_label.replace(/ /g, '_').toLowerCase() || 'na',
      office_location: 'na',
      office_id: this.cookieService.get('wirCounsellorTeam').toLowerCase(),
      user_login_status: userLoginStatusGTM,
      study_mode: 'na'
    }

     if(pagenameGTM!== 'email_page'){
      payload.user_id = CryptoJS.SHA256(this.userInputService.getValue('primary_email')?.option_label || '').toString(CryptoJS.enc.Hex)
    }
    this.getDataLayer().push(payload);
  }
}
