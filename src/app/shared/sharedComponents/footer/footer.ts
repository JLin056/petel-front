import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {
    constructor(
        private route: Router
    ) {}
    showMerchantLogin(){
        this.route.navigate(['merchants/login'])
    }

    showMerchantRegister() {
        this.route.navigate(['merchants/register'])
    }
}
