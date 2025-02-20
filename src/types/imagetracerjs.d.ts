declare module 'imagetracerjs' {
  interface ImageTracerOptions {
    corsenabled?: boolean;
    ltres?: number;
    qtres?: number;
    pathomit?: number;
    rightangleenhance?: boolean;
    colorsampling?: number;
    numberofcolors?: number;
    mincolorratio?: number;
    colorquantcycles?: number;
    layering?: number;
    strokewidth?: number;
    linefilter?: boolean;
    scale?: number;
    roundcoords?: number;
    viewbox?: boolean;
    desc?: boolean;
    lcpr?: number;
    qcpr?: number;
    [key: string]: any;
  }

  interface ImageTracer {
    imageToSVG(url: string, options: ImageTracerOptions, callback: (svgstr: string) => void): void;
    imagedataToSVG(imagedata: ImageData, options: ImageTracerOptions): string;
    appendSVGString(svgstr: string, parentid: string): void;
  }

  const ImageTracer: ImageTracer;
  export default ImageTracer;
}
