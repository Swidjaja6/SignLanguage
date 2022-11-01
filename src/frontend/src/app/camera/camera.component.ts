import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss']
})
export class CameraComponent implements OnInit {
  
  @ViewChild('webcam') webcam!: ElementRef; 
  webcamWidth: number = 50000;

  constructor(private elRef: ElementRef) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(){
    this.webcamWidth = this.webcam.nativeElement.offsetWidth;
  }

}
