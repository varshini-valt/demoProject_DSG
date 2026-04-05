import { Injectable } from '@angular/core'

@Injectable({
  providedIn: 'root'
})
export class UuidServiceService {
  uuidv4 (): string {
    const cryptoObj = window.crypto
    const buf = new Uint8Array(16)
    cryptoObj?.getRandomValues(buf)
    buf[6] = (buf[6] & 0x0f) | 0x40
    buf[8] = (buf[8] & 0x3f) | 0x80
    return (
      this.hex(buf[0]) +
            this.hex(buf[1]) +
            this.hex(buf[2]) +
            this.hex(buf[3]) +
            '-' +
            this.hex(buf[4]) +
            this.hex(buf[5]) +
            '-' +
            this.hex(buf[6]) +
            this.hex(buf[7]) +
            '-' +
            this.hex(buf[8]) +
            this.hex(buf[9]) +
            '-' +
            this.hex(buf[10]) +
            this.hex(buf[11]) +
            this.hex(buf[12]) +
            this.hex(buf[13]) +
            this.hex(buf[14]) +
            this.hex(buf[15])
    )
  }

  public hex (value: number): string {
    return ('0' + value.toString(16)).slice(-2)
  }
}
