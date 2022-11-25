import { Component, OnInit, ViewChild, createComponent, ViewContainerRef, EnvironmentInjector, ComponentRef, TemplateRef } from '@angular/core';
import { CameraComponent } from '../camera/camera.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  showMediapipe = false;
  listLeft = ['ASL',];
  listRight = ['English',];
  sourceType: string = "ASL";
  destType: string = 'English';
  @ViewChild('leftPane', { read: ViewContainerRef }) leftPane!: ViewContainerRef;
  @ViewChild('rightPane', { read: ViewContainerRef }) rightPane!: ViewContainerRef;
  @ViewChild('textArea', { read: TemplateRef}) textArea!: TemplateRef<any>;
  @ViewChild('textAreaRO', { read: TemplateRef}) textAreaRO!: TemplateRef<any>;
  cameraRef!: ComponentRef<CameraComponent>;

  constructor(private injector: EnvironmentInjector) { }

  ngOnInit(): void {  }

  ngAfterViewInit(){
    this.updateView()    
  }

  switchMediapipe(e:any){
    this.showMediapipe = e.checked
    // this.cameraRef.instance.showMediapipe = this.showMediapipe;
    this.cameraRef.setInput('showMediapipe', this.showMediapipe)
  }

  updateView(){
    this.rightPane.clear();
    this.leftPane.clear();
    if(this.cameraRef){
      this.cameraRef.destroy();
    }
    switch(this.sourceType){
      case 'ASL':
        this.cameraRef = createComponent(CameraComponent, {
          environmentInjector: this.injector
        });
        this.cameraRef.instance.showMediapipe = this.showMediapipe;
        this.leftPane.insert(this.cameraRef.hostView)
        break;
      default:
        let tempRef = this.textArea.createEmbeddedView({name: "text view"});
        this.leftPane.insert(tempRef);
    }
    switch(this.destType){
      case 'ASL':
        //TODO
        this.cameraRef = createComponent(CameraComponent, {
          environmentInjector: this.injector
        });
        this.cameraRef.instance.showMediapipe = this.showMediapipe;
        this.rightPane.insert(this.cameraRef.hostView)
        break;
      default:
        let tempRef = this.textAreaRO.createEmbeddedView({name: "text view"});        
        this.rightPane.insert(tempRef);
    }
  }

  setSourceType(src:string){
    if(this.sourceType === src) return;
    this.sourceType = src;
    this.updateView();
  }

  setDestType(dest: string){
    if(this.destType === dest) return;
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