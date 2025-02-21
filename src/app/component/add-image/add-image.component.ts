import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { saveAs } from 'file-saver';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ImageConverterService } from '../../services/image-converter.service';
import { ButtonModule } from 'primeng/button';
import { ImageService } from '../../services/image.service';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-add-image',
  imports: [
    CommonModule,
    ProgressSpinnerModule,
    NgxDropzoneModule,
    MatButtonModule,
    MatIconModule,
    ToggleSwitchModule,
    FormsModule,
    ButtonModule,
    RouterModule,
  ],
  templateUrl: './add-image.component.html',
  styleUrl: './add-image.component.css',
})
export class AddImageComponent {
  @ViewChild('svgContainer') svgContainer!: ElementRef;
  checked: boolean = false;
  sanitizedSvgContent: SafeHtml | null = null;
  isConverting = false;
  error: string | null = null;
  selecting: boolean = false;
  loading: boolean = false;
  constructor(
    private imageConverter: ImageConverterService,
    private sanitizer: DomSanitizer,
    public imageService: ImageService,
    private messageService: MessageService,
    private router: Router
  ) {}

  getImagePosition(x: number, y: number) {
    const position = document.getElementsByClassName('preview-container');
    if (!this.checked || !this.sanitizedSvgContent || !position) return null;
    const rect = position[0].getBoundingClientRect();
    return (
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    );
  }

  addEventListener() {
    let startX: number, startY: number, endX: number, endY: number;

    document.addEventListener('mousedown', (e) => {
      this.selecting = true;
      startX = e.clientX;
      startY = e.clientY;
      if (!this.getImagePosition(startX, startY)) {
        return;
      }
      const selectionBox = document.getElementById('selectionBox');
      if (!selectionBox) {
        return;
      }
      selectionBox.style.left = `${startX}px`;
      selectionBox.style.top = `${startY}px`;
      selectionBox.style.width = '0px';
      selectionBox.style.height = '0px';
      selectionBox.style.display = 'block';
    });

    document.addEventListener('mousemove', (e) => {
      if (!this.selecting) return;

      endX = e.clientX;
      endY = e.clientY;
      if (!this.getImagePosition(startX, startY)) {
        return;
      }
      const width = Math.abs(endX - startX);
      const height = Math.abs(endY - startY);
      const selectionBox = document.getElementById('selectionBox');
      if (!selectionBox) {
        return;
      }
      selectionBox.style.width = `${width}px`;
      selectionBox.style.height = `${height}px`;
      selectionBox.style.left = `${Math.min(startX, endX)}px`;
      selectionBox.style.top = `${Math.min(startY, endY)}px`;
      selectionBox.style.display = 'block';
    });

    document.addEventListener('mouseup', () => {
      if (!this.getImagePosition(startX, startY)) {
        return;
      }
      let value = prompt('Enter redirection url');
      if (!value) {
        return;
      }
      this.addEventHandlerToPath(startX, endX, startY, endY, value);
    });
  }

  addEventHandlerToPath(
    startX: number,
    endX: number,
    startY: number,
    endY: number,
    value: string
  ) {
    this.loading = true;
    if (!this.loading) return;
    setTimeout(() => {
      const svg = document.querySelector('svg');
      let array = [];
      array.push(...(svg?.querySelectorAll('path') || []));
      array.push(...(svg?.querySelectorAll('rect') || []));
      array.length > 0 &&
        Promise.all(
          array.map((path) => {
            if (
              path.getBoundingClientRect().x > startX &&
              path.getBoundingClientRect().x < endX &&
              path.getBoundingClientRect().y > startY &&
              path.getBoundingClientRect().y < endY
            ) {
              const parent = path.parentElement;
              console.log('Count');

              if (!parent) return;
              if (parent.tagName !== 'a') {
                const anchor = document.createElementNS(
                  'http://www.w3.org/2000/svg',
                  'a'
                );
                anchor.setAttributeNS(null, 'href', '/' + value);
                anchor.setAttributeNS(null, 'target', '_blank');

                // Clone the path to avoid reference issues
                const clonedPath = path.cloneNode(true) as SVGPathElement;

                // Add hover effect
                clonedPath.style.transition = 'opacity 0.3s ease';
                clonedPath.addEventListener('mouseenter', () => {
                  clonedPath.style.opacity = '0.7';
                });
                clonedPath.addEventListener('mouseleave', () => {
                  clonedPath.style.opacity = '1';
                });

                // Replace original path with anchor wrapped path
                anchor.appendChild(clonedPath);
                parent.replaceChild(anchor, path);
              } else {
                parent?.setAttribute('href', value);
              }
            }
            return Promise.resolve();
          })
        ).then(() => {
          this.selecting = false;
          this.loading = false;
        });
    }, 100);
  }

  async onFileSelected(event: { addedFiles: File[] }) {
    const file = event.addedFiles[0];
    if (file) {
      this.isConverting = true;
      this.error = null;
      // Define allowed image types
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/svg+xml',
        'image/gif',
        'image/webp',
      ];

      // Check if file type is allowed
      if (!allowedTypes.includes(file.type)) {
        this.isConverting = false;
        alert(
          'Error: Invalid file type. Please upload JPEG, PNG, SVG, GIF, or WebP files only.'
        );
        return;
      }

      try {
        if (file.type === 'image/svg+xml') {
          // For SVG files, read directly as text
          const reader = new FileReader();
          reader.onload = (e) => {
            const svgContent = e.target?.result as string;
            this.sanitizedSvgContent =
              this.sanitizer.bypassSecurityTrustHtml(svgContent);
            this.addEventListener();
          };
          reader.readAsText(file);
        } else {
          // For other image types, convert to SVG
          let svgContent = await this.imageConverter.convertToSVG(file);
          this.sanitizedSvgContent =
            this.sanitizer.bypassSecurityTrustHtml(svgContent);
          this.addEventListener();
        }
      } catch (err) {
        this.error = 'Failed to process image';
        alert('Error: Failed to process the image. Please try again.');
        console.error(err);
      } finally {
        this.isConverting = false;
      }
    }
  }

  downloadSVG() {
    if (this.sanitizedSvgContent) {
      const svg = document.querySelector('.preview-container svg');
      svg?.setAttributeNS(null, 'height', '100%');
      svg?.setAttributeNS(null, 'width', '100%');
      if (svg) {
        // Create a proper SVG document structure
        const svgDoc = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
  <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
  ${svg.outerHTML}`;

        // Clean up the SVG content
        const cleanedSvg = svgDoc
          .replace(/&nbsp;/g, ' ')
          .replace(/\n\s+/g, '\n')
          .trim();

        const blob = new Blob([cleanedSvg], {
          type: 'image/svg+xml;charset=utf-8',
        });

        saveAs(blob, 'converted.svg');
      }
    }
  }
  uploadSVG() {
    if (this.sanitizedSvgContent) {
      const svg = document.querySelector('.preview-container svg');
      svg?.setAttributeNS(null, 'height', '100%');
      svg?.setAttributeNS(null, 'width', '100%');
      if (svg) {
        const svgDoc = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
  <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
  ${svg.outerHTML}`;

        // Clean up the SVG content
        const cleanedSvg = svgDoc
          .replace(/&nbsp;/g, ' ')
          .replace(/\n\s+/g, '\n')
          .trim();
        const image = {
          id: (Math.random() * 10).toString(),
          svg: cleanedSvg,
        };
        this.imageService.uploadImage(image).subscribe(() => {
          this.messageService.add({
            severity: 'info',
            summary: 'Success',
            detail: 'Successfully uploaded Image',
          });
          console.log(this.imageService.images);
          this.router.navigateByUrl('');
        });
      }
    }
  }
}