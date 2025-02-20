import { Injectable } from "@angular/core";
import { optimize, Config } from 'svgo';

@Injectable({
    providedIn: "root"
})
export class ImageCompresser {
    private readonly svgoConfig: Config = {
        multipass: true,
        plugins: [
            {
                name: 'preset-default',
                params: {
                    overrides: {
                        removeViewBox: false,
                        cleanupIds: false,
                        removeUselessStrokeAndFill: false,
                        mergePaths: false, // Disable path merging to preserve objects
                        convertShapeToPath: false // Prevent shapes from being converted to paths
                    },
                },
            },
            {
                name: 'cleanupNumericValues',
                params: {
                    floatPrecision: 2,
                    leadingZero: true,
                }
            },
            // Custom plugin to preserve object paths
            {
                name: 'customPreserveObjects',
                fn: () => ({
                    element: {
                        enter: (node: any) => {
                            if (node.attributes.class === 'detectable-object') {
                                // Preserve all attributes for detectable objects
                                node.preserve = true;
                            }
                        }
                    }
                })
            }
        ]
    };

    compressSVG(svgString: string): string {
        try {
            const result = optimize(svgString, this.svgoConfig);
            if ('data' in result) {
                return result.data;
            }
            throw new Error('SVG optimization failed');
        } catch (error) {
            console.error('SVG compression error:', error);
            return svgString; // Return original if compression fails
        }
    }

    getCompressionStats(original: string, compressed: string): { 
        originalSize: number, 
        compressedSize: number, 
        savings: number 
    } {
        const originalSize = new Blob([original]).size;
        const compressedSize = new Blob([compressed]).size;
        const savings = ((originalSize - compressedSize) / originalSize) * 100;

        return {
            originalSize,
            compressedSize,
            savings
        };
    }
}