import { Component, OnInit, ViewChild, ApplicationRef, createComponent, ViewContainerRef, EnvironmentInjector, ComponentRef } from '@angular/core';
import { CameraComponent } from '../camera/camera.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  listLeft = ['ASL',];
  listRight = ['English',];
  sourceType: string = "ASL";
  destType: string = 'English';
  @ViewChild('leftPane', { read: ViewContainerRef }) leftPane!: ViewContainerRef;
  @ViewChild('rightPane', { read: ViewContainerRef }) rightPane!: ViewContainerRef;
  cameraRef!: ComponentRef<CameraComponent>;

  constructor(private appRef: ApplicationRef, private injector: EnvironmentInjector) { }

  ngOnInit(): void {}

  ngAfterViewInit(){
    this.updateView()
  }

  updateView(){
    switch(this.sourceType){
      case 'ASL':
        this.cameraRef = createComponent(CameraComponent, {
          environmentInjector: this.injector
        });
        this.leftPane.element.nativeElement.appendChild(this.cameraRef.location.nativeElement);
        this.appRef.attachView(this.cameraRef.hostView);
        break;
      default:
        this.cameraRef.destroy();
        //TODO
    }

    switch(this.destType){
      case 'ASL':
        this.rightPane.element.nativeElement.innerHTML = "";
        //TODO        
        break;
      default:
        this.rightPane.element.nativeElement.innerHTML = "";
        //TODO
    }
  }

  setSourceType(src:string){
    this.sourceType = src;
    this.updateView();
  }

  setDestType(dest: string){
    this.destType = dest;
    this.updateView();
  }

  swap(){
    let temp = this.listLeft;
    this.listLeft = this.listRight;
    this.listRight = temp;
    let temp1 = this.sourceType;
    this.sourceType = this.destType;
    this.destType = temp1;
    this.updateView();
  }
}