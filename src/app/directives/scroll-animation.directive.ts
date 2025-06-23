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
    this.el.nativeElement.classList.add('scroll-animation');

    this.scrollAnimationService
      .observeElement(this.el.nativeElement)
      .subscribe((visibleElement) => {
        if (this.el.nativeElement === visibleElement) {
          if (this.delay) {
            this.timeout = setTimeout(() => {
              this.el.nativeElement.classList.add(this.animationClass);
            }, this.delay);
          } else {
            this.el.nativeElement.classList.add(this.animationClass);
          }
        }
      });
  }

  ngOnDestroy(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.scrollAnimationService.unobserveElement(this.el.nativeElement);
  }
}
