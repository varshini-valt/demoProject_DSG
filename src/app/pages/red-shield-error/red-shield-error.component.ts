import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'app-red-shield-error',
  templateUrl: './red-shield-error.component.html',
  styleUrls: ['./red-shield-error.component.css'],
  standalone: true
})

export class RedShieldErrorComponent implements OnInit {
  redShieldId: any = localStorage.getItem('redShieldId')
  ngOnInit (): void {
  }
}
