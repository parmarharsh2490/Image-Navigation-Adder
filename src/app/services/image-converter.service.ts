import { Injectable } from '@angular/core';
import ImageTracer from 'imagetracerjs';

@Injectable({
  providedIn: 'root',
})
export class ImageConverterService {

  private readonly objectDetectionOptions = {
    corsenabled: true,
    ltres: 1,
    qtres: 1,
    pathomit: 8, // Increased to remove noise
    rightangleenhance: true,
    colorsampling: 1, // Changed to 1 for better object detection
    numberofcolors: 24, // Reduced colors for better object separation
    mincolorratio: 0.02, // Ignore very small color areas
    colorquantcycles: 5, // Reduced for better performance
    layering: 0,
    strokewidth: 1,
    linefilter: true, // Enable line filtering
    scale: 1,
    roundcoords: 1, // Reduced for better performance
    viewbox: true,
    desc: false,
    lcpr: 0,
    qcpr: 0,
  };

  private readonly MAX_IMAGE_SIZE = 1500; // Maximum dimension in pixels

  constructor() {}

  async convertToSVG(imageFile: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Resize image if too large
          const { width, height } = this.calculateAspectRatio(
            img.width,
            img.height
          );

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            // Enable image smoothing for better quality
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Draw resized image
            ctx.drawImage(img, 0, 0, width, height);

            // Process image in chunks if needed
            this.processImageInChunks(canvas, ctx, resolve, reject);
          } else {
            reject(new Error('Could not get canvas context'));
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(imageFile);
    });
  }

  private calculateAspectRatio(
    width: number,
    height: number
  ): { width: number; height: number } {
    if (width <= this.MAX_IMAGE_SIZE && height <= this.MAX_IMAGE_SIZE) {
      return { width, height };
    }

    const ratio = Math.min(
      this.MAX_IMAGE_SIZE / width,
      this.MAX_IMAGE_SIZE / height
    );
    return {
      width: Math.floor(width * ratio),
      height: Math.floor(height * ratio),
    };
  }

  private processImageInChunks(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    resolve: (value: string) => void,
    reject: (reason?: any) => void
  ) {
    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const svgString = ImageTracer.imagedataToSVG(
        imageData,
        this.objectDetectionOptions
      );

      // Extract and label potential objects
      const labeledSVG = this.labelObjects(svgString);
      resolve(labeledSVG);
    } catch (error) {
      reject(error);
    }
  }

  private labelObjects(svgString: string): string {
    // Add IDs to major paths for better object identification
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const paths = doc.querySelectorAll('path');

    paths.forEach((path, index) => {
      const pathLength = path.getTotalLength();
      const area = this.calculatePathArea(path);

      // Only label significant paths
      if (area > 500) {
        // Adjust threshold as needed
        path.setAttribute('id', `object_${index}`);
        path.setAttribute('class', 'detectable-object');
        // Add data attributes for potential object information
        path.setAttribute('data-area', area.toString());
      }
    });

    return new XMLSerializer().serializeToString(doc);
  }

  private calculatePathArea(path: SVGPathElement): number {
    const bbox = path.getBBox();
    return bbox.width * bbox.height;
  }
}
