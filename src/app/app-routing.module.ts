import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { SignInComponent } from './pages/sign-in/sign-in.component'
import { ThankYouComponent } from './pages/thank-you/thank-you.component'
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component'
import { CanActivateRouteModule } from './common/api/services/routing-module'
import { SignUpNewComponent } from './pages/sign-up-new/sign-up-new.component'
import { QrSignInComponent } from './pages/qr-sign-in/qr-sign-in.component'
import { QrSignUpComponent } from './pages/qr-sign-up/qr-sign-up.component'
import { QrForgotPasswordComponent } from './pages/qr-forgot-password/qr-forgot-password.component'

const routes: Routes = [

  { path: '', component: SignInComponent },
  { path: 'signupnew', component: SignUpNewComponent, canActivate: [CanActivateRouteModule] },
  { path: 'thankyou', component: ThankYouComponent },
  { path: 'error', component: PageNotFoundComponent },
  { path: 'qrSignin', component: QrSignInComponent },
  { path: 'qrSignup', component: QrSignUpComponent },
  { path: 'qrForgotPwd', component: QrForgotPasswordComponent }

]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
