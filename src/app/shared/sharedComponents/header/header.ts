import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  imports: [FormsModule, ButtonModule, InputGroupModule, InputGroupAddonModule, InputTextModule, SelectModule, InputNumberModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {


}
