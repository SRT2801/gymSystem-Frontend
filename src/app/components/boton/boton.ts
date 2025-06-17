import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-boton',
  imports: [],
  templateUrl: './boton.html',
  styleUrl: './boton.scss',
})
export class Boton {
  @Input() texto: string = '';
  @Input() tipo: string = 'primary';
  @Input() icono: string = '';
  @Input() disabled: boolean = false;

  constructor() {}

  onClick() {
    console.log(`${this.texto} button clicked`);
  }
}
