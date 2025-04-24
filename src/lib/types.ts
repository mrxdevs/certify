
export interface CertificateTemplate {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  components: CertificateComponent[];
  variables: CertificateVariable[];
}

export interface CertificateComponent {
  id: string;
  type: 'text' | 'image' | 'shape' | 'qrcode' | 'variable';
  content?: string;
  properties: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    zIndex: number;
    [key: string]: any;
  };
}

export interface CertificateVariable {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'date' | 'number' | 'email';
  required: boolean;
  defaultValue?: string;
}

export interface Certificate {
  id: string;
  templateId: string;
  certificateId: string;
  recipientName: string;
  issuedAt: Date;
  variables: Record<string, string>;
  fileUrl?: string;
}
