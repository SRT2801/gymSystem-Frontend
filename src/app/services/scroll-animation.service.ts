import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ScrollAnimationService {
  private intersectionObserver!: IntersectionObserver;
  private elementInViewportSubject = new Subject<Element>();

  constructor(private ngZone: NgZone) {

    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };


    this.ngZone.runOutsideAngular(() => {
      this.intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {

            this.ngZone.run(() => {
              this.elementInViewportSubject.next(entry.target);
            });

            this.intersectionObserver.unobserve(entry.target);
          }
        });
      }, options);
    });
  }

  /**
   * @param element
   * @returns
   */
  observeElement(element: Element): Observable<Element> {
    this.intersectionObserver.observe(element);
    return this.elementInViewportSubject.asObservable();
  }

  /**
   *
   * @param element }
   */
  unobserveElement(element: Element): void {
    this.intersectionObserver.unobserve(element);
  }

  /**
   *
   * @param element
   * @param className 
   */
  addClassOnVisible(element: Element, className: string): void {
    this.observeElement(element).subscribe((visibleElement) => {
      if (element === visibleElement) {
        element.classList.add(className);
      }
    });
  }
}
