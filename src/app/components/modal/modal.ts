import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './modal.html',
  styleUrls: ['./modal.scss'],
})
export class ModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';

  @Output() closeModal = new EventEmitter<void>();

  // Cierra el modal cuando se hace clic en el overlay
  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close();
    }
  }

  // Cierra el modal cuando se presiona la tecla Escape
  @HostListener('document:keydown.escape')
  onEscapeKeydown(): void {
    if (this.isOpen) {
      this.close();
    }
  }

  close(): void {
    this.closeModal.emit();
  }
}
