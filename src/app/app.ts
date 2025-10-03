import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TestHomepage } from "./shared/sharedComponents/test-homepage/test-homepage";


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TestHomepage],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('petelFrontTest');
}
