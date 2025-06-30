import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-searchbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './searchbar.html',
  styleUrls: ['./searchbar.scss'],
})
export class SearchbarComponent implements OnChanges {
  @Input() placeholder: string = 'Buscar...';
  @Input() debounceTime: number = 300;
  @Input() cssClass: string = '';
  @Input() showIcon: boolean = true;
  @Input() iconPosition: 'left' | 'right' = 'left';
  @Input() clearable: boolean = true;
  @Input() initialValue: string = '';
  @Input() minLength: number = 3;

  @Output() search = new EventEmitter<string>();
  @Output() clear = new EventEmitter<void>();

  searchTerm: string = '';
  private timeout: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['initialValue'] &&
      changes['initialValue'].currentValue !== undefined
    ) {
      this.searchTerm = changes['initialValue'].currentValue;
    }
  }

  onInputChange(): void {
    clearTimeout(this.timeout);

    this.timeout = setTimeout(() => {
      if (
        this.searchTerm.trim() === '' ||
        this.searchTerm.trim().length >= this.minLength
      ) {
        this.search.emit(this.searchTerm);
      }
    }, this.debounceTime);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.search.emit('');
    this.clear.emit();
  }
}
