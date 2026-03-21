interface Certificate {
    id: string;
    studentName: string;
    courseTitle: string;
    issuedAt: string;
    certificateNumber: string;
    status: 'issued' | 'pending' | 'revoked';
}
interface CertificatesListProps {
    certificates: Certificate[];
    designCategory?: string;
}
export declare function CertificatesList({ certificates, _designCategory }: CertificatesListProps): import("react/jsx-runtime").JSX.Element;
export {};
