import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-boton',
  imports: [NgIf],
  templateUrl: './boton.html',
  styleUrl: './boton.scss',
  standalone: true,
})
export class Boton {
  @Input() texto: string = '';
  @Input() tipo: string = 'primary';
  @Input() icono: string = '';
  @Input() imagen: string = '';
  @Input() disabled: boolean = false;
  @Input() fullWidth: boolean = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() isLoading: boolean = false;

  @Output() buttonClick = new EventEmitter<void>();

  constructor() {}

  onButtonClick() {
    if (!this.disabled) {
      this.buttonClick.emit();
    }
  }
}
