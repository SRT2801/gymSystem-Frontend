import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  standalone: true,
})
export class Home implements OnInit {
  // Estado básico para la interfaz
  isLoaded = true;

  // Datos para las secciones
  stats = [
    { value: 2500, label: 'Miembros', icon: 'fa-users', suffix: '+' },
    { value: 45, label: 'Clases', icon: 'fa-calendar-check', suffix: '' },
    { value: 25, label: 'Entrenadores', icon: 'fa-user-tie', suffix: '' },
    { value: 99, label: 'Satisfacción', icon: 'fa-star', suffix: '%' },
  ];

  classes = [
    {
      name: 'Crossfit',
      image:
        'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800',
      description: 'Entrenamiento de alta intensidad',
      schedule: 'Lun, Mié, Vie 7:00 AM',
    },
    {
      name: 'Yoga',
      image:
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800',
      description: 'Equilibra cuerpo y mente',
      schedule: 'Mar, Jue 6:00 PM',
    },
    {
      name: 'Spinning',
      image:
        'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=800',
      description: 'Cardio de alto impacto',
      schedule: 'Lun a Vie 6:00 PM',
    },
    {
      name: 'Boxeo',
      image:
        'https://images.unsplash.com/photo-1549824506-b7045a1be677?auto=format&fit=crop&w=800',
      description: 'Técnica y resistencia',
      schedule: 'Mar, Jue, Sáb 8:00 AM',
    },
  ];

  trainers = [
    {
      name: 'Carlos Gómez',
      specialty: 'Entrenador de CrossFit',
      image:
        'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=800',
    },
    {
      name: 'Laura Martínez',
      specialty: 'Instructora de Yoga',
      image:
        'https://images.unsplash.com/photo-1593164842264-854604db2260?auto=format&fit=crop&w=800',
    },
    {
      name: 'Miguel Ángel',
      specialty: 'Nutricionista Deportivo',
      image:
        'https://images.unsplash.com/photo-1648737966832-042ef51aec9e?auto=format&fit=crop&w=800',
    },
    {
      name: 'Ana Torres',
      specialty: 'Entrenadora Personal',
      image:
        'https://images.unsplash.com/photo-1609899537878-88d5ba429bbb?auto=format&fit=crop&w=800',
    },
  ];

  constructor() {
    console.log('[DEBUG] Inicializando componente Home sin GSAP');
  }

  ngOnInit(): void {
    console.log('[DEBUG] Home inicializado correctamente');
  }
}
