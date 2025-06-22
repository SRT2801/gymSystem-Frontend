import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ScrollAnimationService {
  private intersectionObserver!: IntersectionObserver;
  private elementInViewportSubject = new Subject<Element>();

  constructor(private ngZone: NgZone) {
    // Configuración del IntersectionObserver
    const options = {
      root: null, // viewport por defecto
      rootMargin: '0px',
      threshold: 0.1, // Cuando al menos el 10% del elemento es visible
    };

    // Crear fuera de la zona de Angular para evitar ciclos de detección innecesarios
    this.ngZone.runOutsideAngular(() => {
      this.intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Ejecutar dentro de la zona de Angular para que se actualicen las vistas
            this.ngZone.run(() => {
              this.elementInViewportSubject.next(entry.target);
            });
            // Una vez que el elemento es visible, dejamos de observarlo (para animaciones que solo ocurren una vez)
            // Si quieres que la animación se repita cada vez que aparece en el viewport, comenta esta línea
            this.intersectionObserver.unobserve(entry.target);
          }
        });
      }, options);
    });
  }

  /**
   * Observa un elemento para detectar cuando entra en el viewport
   * @param element El elemento DOM a observar
   * @returns Observable que emite cuando el elemento entra en el viewport
   */
  observeElement(element: Element): Observable<Element> {
    this.intersectionObserver.observe(element);
    return this.elementInViewportSubject.asObservable();
  }

  /**
   * Deja de observar un elemento
   * @param element El elemento DOM a dejar de observar
   */
  unobserveElement(element: Element): void {
    this.intersectionObserver.unobserve(element);
  }

  /**
   * Agrega una clase CSS cuando el elemento entra en el viewport
   * @param element El elemento DOM a animar
   * @param className La clase CSS a añadir cuando el elemento sea visible
   */
  addClassOnVisible(element: Element, className: string): void {
    this.observeElement(element).subscribe((visibleElement) => {
      if (element === visibleElement) {
        element.classList.add(className);
      }
    });
  }
}
