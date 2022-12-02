import { AfterViewInit, Component, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import * as mpHolistic from '@mediapipe/holistic'
import * as mpControls from '@mediapipe/control_utils'
import * as drawingUtils from '@mediapipe/drawing_utils'
import * as tf from '@tensorflow/tfjs'
import {Camera} from '@mediapipe/camera_utils'
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'loading-dialog',
  templateUrl: 'loadingDialog.component.html',
})
export class ModelLoadingDialog  {
  constructor(public dialogRef: MatDialogRef<ModelLoadingDialog>) {}
}

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss']
})
export class CameraComponent implements AfterViewInit {

  @Input('showMediapipe') showMediapipe: boolean = false;
  @Input('singleSequenceMode') singleSequenceMode: boolean = false;
  @Output("predictions") predictionsEvent = new EventEmitter<string[]>();
  predictions:string[] = [];

  @ViewChild('mainWrapper') mainWrapper:any;
  @ViewChild('webcam') webcamRef:any; 
  @ViewChild('canvas') canvasRef:any;
  @ViewChild('control') controlP:any;
  webcam!: HTMLVideoElement;
  camera:any;

  activeEffect = 'mask';
  canvasCtx :any;
  sequence:any = [];
  model:any;
  holistic:any;
  loading = true;
  recording= false;

  constructor(public dialog: MatDialog) {
    
  }

  ngOnChanges(changes:SimpleChanges){
    if(changes['showMediapipe'] && changes['showMediapipe'].currentValue == true){
      this.webcam.hidden = true;
      this.canvasRef.nativeElement.hidden = false
    }
    else if(changes['showMediapipe'] && changes['showMediapipe'].currentValue == false){
      this.webcam.hidden = false;
      this.canvasRef.nativeElement.hidden = true
    }
    if(changes['singleSequenceMode']){
      console.log('mode changed')
    }
  }

  async ngAfterViewInit(){
    //load model
    this.model = await tf.loadLayersModel('../../assets/tfjs_converted_model/model.json');
    //setup mediapipe
    this.initMediapipe();
    this.openDialog()
    //setup cam
    this.setupWebcam()
    this.camera.start()

    //get canvas context
    this.canvasCtx = this.canvasRef.nativeElement.getContext('2d');
  }

  startRecord(){
    if(!this.singleSequenceMode) return;
    this.sequence = [];
    this.predictions = [];
    this.recording = true;
    this.mainWrapper.nativeElement.classList.add('blink-record');
  }

  addPrediction(word: string){
    this.predictions.push(word);
    this.predictionsEvent.emit(this.predictions);
  }

  openDialog(): void {
    this.dialog.open(ModelLoadingDialog, {
      width: '250px',
    })
  }

  initMediapipe(){
    const config = {locateFile: (file:any) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic@` +
             `${mpHolistic.VERSION}/${file}`;
    }};
    this.holistic = new mpHolistic.Holistic(config);
    this.holistic.onResults(this.onResults.bind(this));
    this.initMediapipeControls();
  }

  initMediapipeControls(){
    new mpControls.ControlPanel(this.controlP.nativeElement, {
      selfieMode: true,
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
      effect: 'background',
    }).on(x => {
      const options = x as mpHolistic.Options;
      this.activeEffect = (x as {[key: string]: string})['effect'];
      this.holistic.setOptions(options);
    });;
  }

  setupWebcam(){
    this.webcam = this.webcamRef.nativeElement;
    const constraints = {
      video: {facingMode: 'user'}
    };
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      this.webcam.srcObject = stream;
      let {width, height} = stream.getTracks()[0].getSettings();
      this.canvasRef.nativeElement.width = width;
      this.canvasRef.nativeElement.height = height;
    });
    this.camera = new Camera(this.webcam, {
      onFrame: async() => {      
        if(this.webcam.videoWidth) await this.holistic.send({image: this.webcam});
      }
    })
    
  }

  processLandmarksForPrediction(results: mpHolistic.Results){
    //pose
    let pose = new Array(132).fill(0);;  // array of 132 zeroes
    if(results.poseLandmarks){
      pose = [];
      for(let landmark of results.poseLandmarks){
        pose.push(landmark.x)
        pose.push(landmark.y)
        pose.push(landmark.z)
        pose.push(landmark.visibility)
      }
    }

    //face
    let face = new Array(1404).fill(0);;  // array of 132 zeroes
    if(results.faceLandmarks){
      face = [];
      for(let landmark of results.faceLandmarks){
        face.push(landmark.x)
        face.push(landmark.y)
        face.push(landmark.z)
      }
    }

    //lhnd
    let lhnd = new Array(21*3).fill(0);;  // array of 132 zeroes
    if(results.leftHandLandmarks){
      lhnd = [];
      for(let landmark of results.leftHandLandmarks){
        lhnd.push(landmark.x)
        lhnd.push(landmark.y)
        lhnd.push(landmark.z)
      }
    }

    //rhnd
    let rhnd = new Array(21*3).fill(0);;  // array of 132 zeroes
    if(results.rightHandLandmarks){
      rhnd = [];
      for(let landmark of results.rightHandLandmarks){
        rhnd.push(landmark.x)
        rhnd.push(landmark.y)
        rhnd.push(landmark.z)
      }
    }

    return pose.concat(face, lhnd, rhnd);
  }

  argMax(array : number[]) {
    return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
  }

  onResults(results: mpHolistic.Results): void{
    this.loading = false;
    this.dialog.closeAll()
    if(this.showMediapipe){
      this.drawLandmarks(results);
    }
    let landmarks = this.processLandmarksForPrediction(results);
    let actions = ['hello', 'thanks', 'iloveyou', 'nothing', 'a', 'two']
    
    if(this.singleSequenceMode){
      if(this.sequence.length < 30){
        this.sequence.push(landmarks);
      }
      else if(this.sequence.length == 30 && this.recording){
        let tr = this.model.predict(tf.tensor([this.sequence]));
        let preds = tr.dataSync();
        let currentPred = actions[this.argMax(Array.from(preds))];
        this.addPrediction(currentPred);
        this.recording = false;
        this.mainWrapper.nativeElement.classList.remove('blink-record');
      }
    }
    else{
      this.sequence.push(landmarks);
      this.sequence = this.sequence.slice(-30);
      if(this.sequence && this.sequence.length ==30){
        let tr = this.model.predict(tf.tensor([this.sequence]));
        let preds = tr.dataSync();
        let currentPred = actions[this.argMax(Array.from(preds))];
        if(this.predictions.at(-1) != currentPred){
          this.addPrediction(currentPred);
        }
      }
    }
  }

  drawLandmarks(results: mpHolistic.Results): void {
    // Hide the spinner.
    // document.body.classList.add('loaded');
  
    // Remove landmarks we don't want to draw.
    // this.removeLandmarks(results);
  
  
    // Draw the overlays.
    this.canvasCtx.save();
    this.canvasCtx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
  
    if (results.segmentationMask) {
      this.canvasCtx.drawImage(
          results.segmentationMask, 0, 0, this.canvasRef.nativeElement.width,
          this.canvasRef.nativeElement.height);
  
      // Only overwrite existing pixels.
      if (this.activeEffect === 'mask' || this.activeEffect === 'both') {
        this.canvasCtx.globalCompositeOperation = 'source-in';
        // This can be a color or a texture or whatever...
        this.canvasCtx.fillStyle = '#00FF007F';
        this.canvasCtx.fillRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
      } else {
        this.canvasCtx.globalCompositeOperation = 'source-out';
        this.canvasCtx.fillStyle = '#0000FF7F';
        this.canvasCtx.fillRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
      }
  
      // Only overwrite missing pixels.
      this.canvasCtx.globalCompositeOperation = 'destination-atop';
      this.canvasCtx.drawImage(
          results.image, 0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
  
      this.canvasCtx.globalCompositeOperation = 'source-over';
    } else {
       this.canvasCtx.drawImage(
           results.image, 0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
    }
  
    // Connect elbows to hands. Do this first so that the other graphics will draw
    // on top of these marks.
    this.canvasCtx.lineWidth = 5;
    if (results.poseLandmarks) {
      if (results.rightHandLandmarks) {
        this.canvasCtx.strokeStyle = 'white';
        this.connect(this.canvasCtx, [[
                  results.poseLandmarks[mpHolistic.POSE_LANDMARKS.RIGHT_ELBOW],
                  results.rightHandLandmarks[0]
                ]]);
      }
      if (results.leftHandLandmarks) {
        this.canvasCtx.strokeStyle = 'white';
        this.connect(this.canvasCtx, [[
                  results.poseLandmarks[mpHolistic.POSE_LANDMARKS.LEFT_ELBOW],
                  results.leftHandLandmarks[0]
                ]]);
      }
    }
  
    if(results.poseLandmarks){
      // Pose...
      drawingUtils.drawConnectors(
        this.canvasCtx, results.poseLandmarks, mpHolistic.POSE_CONNECTIONS,
        {color: 'white'});
      drawingUtils.drawLandmarks(
        this.canvasCtx,
        Object.values(mpHolistic.POSE_LANDMARKS_LEFT)
          .map(index => results.poseLandmarks[index]),
        {visibilityMin: 0.65, color: 'white', fillColor: 'rgb(255,138,0)'}
      );
      drawingUtils.drawLandmarks(
        this.canvasCtx,
        Object.values(mpHolistic.POSE_LANDMARKS_RIGHT)
          .map(index => results.poseLandmarks[index]),
        {visibilityMin: 0.65, color: 'white', fillColor: 'rgb(0,217,231)'}
      );

    }
    
  
    // Hands...
    drawingUtils.drawConnectors(
        this.canvasCtx, results.rightHandLandmarks, mpHolistic.HAND_CONNECTIONS,
        {color: 'white'});
    drawingUtils.drawLandmarks(this.canvasCtx, results.rightHandLandmarks, {
      color: 'white',
      fillColor: 'rgb(0,217,231)',
      lineWidth: 2,
      radius: (data: drawingUtils.Data) => {
        return drawingUtils.lerp(data.from!.z!, -0.15, .1, 10, 1);
      }
    });
    drawingUtils.drawConnectors(
        this.canvasCtx, results.leftHandLandmarks, mpHolistic.HAND_CONNECTIONS,
        {color: 'white'});
    drawingUtils.drawLandmarks(this.canvasCtx, results.leftHandLandmarks, {
      color: 'white',
      fillColor: 'rgb(255,138,0)',
      lineWidth: 2,
      radius: (data: drawingUtils.Data) => {
        return drawingUtils.lerp(data.from!.z!, -0.15, .1, 10, 1);
      }
    });
  
    // Face...
    drawingUtils.drawConnectors(
        this.canvasCtx, results.faceLandmarks, mpHolistic.FACEMESH_TESSELATION,
        {color: '#C0C0C070', lineWidth: 1});
    drawingUtils.drawConnectors(
        this.canvasCtx, results.faceLandmarks, mpHolistic.FACEMESH_RIGHT_EYE,
        {color: 'rgb(0,217,231)'});
    drawingUtils.drawConnectors(
        this.canvasCtx, results.faceLandmarks, mpHolistic.FACEMESH_RIGHT_EYEBROW,
        {color: 'rgb(0,217,231)'});
    drawingUtils.drawConnectors(
        this.canvasCtx, results.faceLandmarks, mpHolistic.FACEMESH_LEFT_EYE,
        {color: 'rgb(255,138,0)'});
    drawingUtils.drawConnectors(
        this.canvasCtx, results.faceLandmarks, mpHolistic.FACEMESH_LEFT_EYEBROW,
        {color: 'rgb(255,138,0)'});
    drawingUtils.drawConnectors(
        this.canvasCtx, results.faceLandmarks, mpHolistic.FACEMESH_FACE_OVAL,
        {color: '#E0E0E0', lineWidth: 5});
    drawingUtils.drawConnectors(
        this.canvasCtx, results.faceLandmarks, mpHolistic.FACEMESH_LIPS,
        {color: '#E0E0E0', lineWidth: 5});
  
    this.canvasCtx.restore();
  }

  removeElements(
    landmarks: mpHolistic.NormalizedLandmarkList, elements: number[]) {
    for (const element of elements) {
      delete landmarks[element];
    }
  }
  
  removeLandmarks(results: mpHolistic.Results) {
    if (results.poseLandmarks) {
      this.removeElements(
        results.poseLandmarks, 
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 16, 17, 18, 19, 20, 21, 22]
      );
    }
  }

  connect(
    ctx: CanvasRenderingContext2D,
    connectors: Array<[mpHolistic.NormalizedLandmark, mpHolistic.NormalizedLandmark]>): void {

    const canvas = ctx.canvas;
    for (const connector of connectors) {
      const from = connector[0];
      const to = connector[1];
      if (from && to) {
        if (from.visibility && to.visibility &&
            (from.visibility < 0.1 || to.visibility < 0.1)) {
          continue;
        }
        ctx.beginPath();
        ctx.moveTo(from.x * canvas.width, from.y * canvas.height);
        ctx.lineTo(to.x * canvas.width, to.y * canvas.height);
        ctx.stroke();
      }
    }
  }


  
}