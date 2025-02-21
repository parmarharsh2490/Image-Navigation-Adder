import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';
import { Image } from '../interface/image';

@Injectable({
  providedIn: 'root',
})

export class ImageService {
  images : Image[] = []
  getImages() : Observable<Image[]> {
    if(this.images.length == 0){
      import("../../assets/images.json").then(images => {
        this.images = images.default as Image[];
        return of(this.images);
      });
    }
    return of([])
  }
  uploadImage(image: Image): Observable<null> {
    this.images.push(image);
    return of(null);
  }
  getSVG(svg: string) {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }
  constructor(private sanitizer: DomSanitizer) {}
}
