import { Scanner } from '@yudiel/react-qr-scanner';
function InstructorExamScannerPage() {
    return <Scanner onScan={(result) => console.log(result)} />;
}

export default InstructorExamScannerPage