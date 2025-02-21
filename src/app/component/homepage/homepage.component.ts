import { Component, inject, OnInit } from '@angular/core';
import { ImageListComponent } from '../image-list/image-list.component';
import { ImageSliderComponent } from '../image-slider/image-slider.component';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ImageService } from '../../services/image.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-homepage',
  imports: [
    ImageListComponent,
    ImageSliderComponent,
    RouterModule,
    ButtonModule,
    ToastModule,
],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css',
})
export class HomepageComponent implements OnInit{
  imageService = inject(ImageService);
  constructor(private messageService : MessageService){}
  ngOnInit(): void {
    this.imageService.getImages().subscribe(() => {
      if(this.imageService.images.length == 3){
        this.messageService.add({ severity: 'info', summary: 'Success', detail: 'Successfully get Images' });
      }
    })
  }
}
