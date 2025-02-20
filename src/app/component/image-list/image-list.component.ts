import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { ImageService } from '../../services/image.service';
@Component({
  selector: 'app-image-list',
  imports: [CommonModule, ButtonModule],
  templateUrl: './image-list.component.html',
  styleUrl: './image-list.component.css',
})
export class ImageListComponent {
  constructor(private sanitizer: DomSanitizer) {}
  imageService = inject(ImageService);
  getSVG(svg: string) {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }
}
