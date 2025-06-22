import {
  AfterViewInit,
  Directive,
  ElementRef,
  Input,
  OnDestroy,
} from '@angular/core';
import { ScrollAnimationService } from '../services/scroll-animation.service';

@Directive({
  selector: '[appScrollAnimation]',
  standalone: true,
})
export class ScrollAnimationDirective implements AfterViewInit, OnDestroy {
  @Input() animationClass: string = 'animate';
  @Input() delay: number = 0;

  private timeout: any;

  constructor(
    private el: ElementRef,
    private scrollAnimationService: ScrollAnimationService
  ) {}

  ngAfterViewInit(): void {
    // Agregar una clase inicial para configurar el estado "oculto"
    this.el.nativeElement.classList.add('scroll-animation');

    this.scrollAnimationService
      .observeElement(this.el.nativeElement)
      .subscribe((visibleElement) => {
        if (this.el.nativeElement === visibleElement) {
          if (this.delay) {
            // Si hay un delay, esperamos antes de aplicar la animación
            this.timeout = setTimeout(() => {
              this.el.nativeElement.classList.add(this.animationClass);
            }, this.delay);
          } else {
            // Si no hay delay, aplicamos la animación inmediatamente
            this.el.nativeElement.classList.add(this.animationClass);
          }
        }
      });
  }

  ngOnDestroy(): void {
    // Limpiar el timeout si existe
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    // Dejar de observar el elemento
    this.scrollAnimationService.unobserveElement(this.el.nativeElement);
  }
}
