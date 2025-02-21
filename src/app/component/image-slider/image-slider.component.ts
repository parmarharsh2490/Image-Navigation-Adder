import { Component } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ImageService } from '../../services/image.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Image } from '../../interface/image';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-image-slider',
  imports: [CarouselModule, ButtonModule, TagModule],
  templateUrl: './image-slider.component.html',
  styleUrl: './image-slider.component.css',
})
export class ImageSliderComponent {

  constructor(public imageService: ImageService) {}
}
