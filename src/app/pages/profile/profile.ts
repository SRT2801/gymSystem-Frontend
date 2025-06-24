import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
})
export class ProfileComponent {
  user = {
    name: 'Usuario de ejemplo',
    email: 'usuario@ejemplo.com',
    phone: '123-456-7890',
    membershipType: 'Premium',
    membershipExpiration: '2023-12-31',
   
  };

  updateProfile() {
    // Aquí iría la lógica para actualizar el perfil
    console.log('Perfil actualizado:', this.user);
    alert('Perfil actualizado correctamente');
  }
}
