import { Component } from '@angular/core';
import { ScrollAnimationDirective } from '../../directives/scroll-animation.directive';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, ScrollAnimationDirective],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  standalone: true,
})
export class Footer {}
