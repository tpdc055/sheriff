import { useRef, forwardRef, useImperativeHandle } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from './ui/button';

export interface SignaturePadRef {
  clear: () => void;
  getSignature: () => string | null;
}

interface SignaturePadProps {
  onSave?: (signature: string) => void;
}

export const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(
  ({ onSave }, ref) => {
    const sigPad = useRef<SignatureCanvas>(null);

    useImperativeHandle(ref, () => ({
      clear: () => {
        sigPad.current?.clear();
      },
      getSignature: () => {
        if (sigPad.current?.isEmpty()) {
          return null;
        }
        return sigPad.current?.toDataURL() || null;
      },
    }));

    const handleClear = () => {
      sigPad.current?.clear();
    };

    const handleSave = () => {
      if (!sigPad.current?.isEmpty()) {
        const signature = sigPad.current?.toDataURL();
        if (signature && onSave) {
          onSave(signature);
        }
      }
    };

    return (
      <div className="space-y-3">
        <div className="border-2 border-stone-300 rounded-lg overflow-hidden bg-white">
          <SignatureCanvas
            ref={sigPad}
            canvasProps={{
              className: 'w-full h-48 touch-none',
            }}
            backgroundColor="white"
            penColor="black"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleClear} variant="outline" className="flex-1">
            Clear
          </Button>
          {onSave && (
            <Button onClick={handleSave} className="flex-1 bg-amber-700 hover:bg-amber-800">
              Save Signature
            </Button>
          )}
        </div>
        <p className="text-xs text-stone-600 text-center">
          Sign above using your finger or stylus
        </p>
      </div>
    );
  }
);

SignaturePad.displayName = 'SignaturePad';
