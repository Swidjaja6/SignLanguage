import { Component, OnInit, ViewChild, createComponent, ViewContainerRef, EnvironmentInjector, ComponentRef, TemplateRef } from '@angular/core';
import { CameraComponent } from '../camera/camera.component';
import { TextComponent } from '../text/text.component';

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
  textAreaRef!: ComponentRef<TextComponent>;
  cameraRef!: ComponentRef<CameraComponent>;
  predictions: string[] = [];
  singleSequenceMode = false;

  constructor(private injector: EnvironmentInjector) { }

  ngOnInit(): void {  }

  ngAfterViewInit(){
    this.updateView()    
  }

  switchMediapipe(e:any){
    this.showMediapipe = e.checked
    this.cameraRef.setInput('showMediapipe', this.showMediapipe);
  }

  switchPredictionMode(e:any){
    this.singleSequenceMode = e.checked;
    this.cameraRef.setInput('singleSequenceMode', this.singleSequenceMode);
  }

  onNewPredictions(predictions: string[]){
    this.predictions = predictions;
    if(this.predictions.at(-1) != 'nothing'){
      this.textAreaRef.instance.addWord(this.predictions.at(-1));
    }
  }


  startRecord(){
    if(!this.singleSequenceMode) return;
    this.cameraRef.instance.startRecord();
  }

  onClear(){
    if(this.cameraRef && this.cameraRef.instance){
      this.cameraRef.instance.predictions = [];
    }
    if(this.textAreaRef && this.textAreaRef.instance){
      this.textAreaRef.instance.clear();
    }
  }

  updateView(){
    this.rightPane.clear();
    this.leftPane.clear();
    if(this.cameraRef){
      this.cameraRef.destroy();
    }
    if(this.textAreaRef){
      this.textAreaRef.destroy();
    }
    switch(this.sourceType){
      case 'ASL':
        this.cameraRef = createComponent(CameraComponent, {
          environmentInjector: this.injector
        });
        this.cameraRef.instance.showMediapipe = this.showMediapipe;
        this.cameraRef.instance.predictionsEvent.subscribe(predictions => {this.onNewPredictions(predictions)});
        this.leftPane.insert(this.cameraRef.hostView)
        break;
      default:
        this.textAreaRef = createComponent(TextComponent, {
          environmentInjector: this.injector
        })
        this.leftPane.insert(this.textAreaRef.hostView);
    }
    switch(this.destType){
      case 'ASL':
        //TODO
        this.cameraRef = createComponent(CameraComponent, {
          environmentInjector: this.injector
        });
        this.cameraRef.instance.predictionsEvent.subscribe(val => console.log(val));
        this.cameraRef.instance.showMediapipe = this.showMediapipe;
        this.rightPane.insert(this.cameraRef.hostView)
        break;
      default:
        this.textAreaRef = createComponent(TextComponent, {
          environmentInjector: this.injector
        })
        this.rightPane.insert(this.textAreaRef.hostView);
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